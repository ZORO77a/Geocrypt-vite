from django.shortcuts import render

# Create your views here.
import os
from datetime import timedelta
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.mail import send_mail
from django.http import FileResponse, HttpResponse
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import File, FileAccessLog, FilePermission, RemoteAccessRequest
from .serializers import (FileSerializer, FileUploadSerializer, 
                         FileAccessLogSerializer, FilePermissionSerializer,
                         RemoteAccessRequestSerializer)
from .utils import FileEncryptor
from geofencing.location_utils import validate_access_conditions
from monitoring.models import UserActivity, SuspiciousActivity


class FileListView(generics.ListAPIView):
    """List files accessible to the user"""
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get files that user has permission to access
        permitted_files = FilePermission.objects.filter(
            user=user,
            is_active=True
        ).values_list('file_id', flat=True)
        
        return File.objects.filter(id__in=permitted_files)


class FileUploadView(APIView):
    """Upload and encrypt a file"""
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        file_serializer = FileUploadSerializer(data=request.data)
        
        if file_serializer.is_valid():
            uploaded_file = request.FILES['file_path']
            
            # Create file record
            file_obj = File(
                name=file_serializer.validated_data['name'],
                original_name=uploaded_file.name,
                file_size=uploaded_file.size,
                mime_type=uploaded_file.content_type,
                uploaded_by=request.user
            )
            
            # Save original file temporarily
            temp_path = default_storage.save(f'temp/{uploaded_file.name}', uploaded_file)
            temp_full_path = os.path.join(settings.MEDIA_ROOT, temp_path)
            
            # Encrypt the file
            encryptor = FileEncryptor()
            encrypted_filename = f"encrypted_{uploaded_file.name}.enc"
            encrypted_path = os.path.join(settings.MEDIA_ROOT, 'encrypted_files', encrypted_filename)
            
            os.makedirs(os.path.dirname(encrypted_path), exist_ok=True)
            
            encryptor.encrypt_file(temp_full_path, encrypted_path)
            
            # Save file record with encrypted key
            file_obj.file_path.name = f'encrypted_files/{encrypted_filename}'
            file_obj.encryption_key = encryptor.key
            file_obj.save()
            
            # Clean up temp file
            os.remove(temp_full_path)
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='FILE_UPLOAD',
                description=f'Uploaded and encrypted file: {uploaded_file.name}',
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                metadata={'file_id': file_obj.id, 'file_name': uploaded_file.name}
            )
            
            return Response(
                FileSerializer(file_obj).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileDownloadView(APIView):
    """Download a file (with access control)"""
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = File.objects.get(id=file_id)
            
            # Check permission
            has_permission = FilePermission.objects.filter(
                user=request.user,
                file=file_obj,
                is_active=True
            ).exists()
            
            if not has_permission:
                return Response(
                    {'error': 'You do not have permission to access this file'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get access parameters from request
            latitude = request.query_params.get('latitude')
            longitude = request.query_params.get('longitude')
            wifi_ssid = request.query_params.get('wifi_ssid')
            
            # Validate access conditions
            access_check = validate_access_conditions(
                request.user,
                latitude=latitude,
                longitude=longitude,
                wifi_ssid=wifi_ssid
            )
            
            if not access_check['overall_access'] and not request.user.is_remote_access_enabled:
                # Log denied access
                FileAccessLog.objects.create(
                    user=request.user,
                    file=file_obj,
                    access_type='DOWNLOAD',
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    location=f"{latitude},{longitude}" if latitude and longitude else '',
                    wifi_ssid=wifi_ssid or '',
                    access_status='DENIED',
                    reason=', '.join(access_check['reasons']),
                    is_suspicious=False
                )
                
                return Response({
                    'error': 'Access denied',
                    'reasons': access_check['reasons'],
                    'checks': access_check['checks']
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update file access info
            file_obj.last_accessed = timezone.now()
            file_obj.access_count += 1
            file_obj.save()
            
            # Log successful access
            FileAccessLog.objects.create(
                user=request.user,
                file=file_obj,
                access_type='DOWNLOAD',
                ip_address=request.META.get('REMOTE_ADDR', ''),
                location=f"{latitude},{longitude}" if latitude and longitude else '',
                wifi_ssid=wifi_ssid or '',
                access_status='GRANTED',
                is_suspicious=False
            )
            
            # Log user activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='FILE_DOWNLOAD',
                description=f'Downloaded file: {file_obj.name}',
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                metadata={'file_id': file_obj.id, 'file_name': file_obj.name}
            )
            
            # Decrypt file for download
            if file_obj.is_encrypted:
                # Decrypt the file
                encryptor = FileEncryptor(file_obj.encryption_key)
                encrypted_path = file_obj.file_path.path
                decrypted_path = encrypted_path.replace('.enc', '.dec')
                
                encryptor.decrypt_file(encrypted_path, decrypted_path)
                
                # Serve decrypted file
                response = FileResponse(open(decrypted_path, 'rb'))
                response['Content-Disposition'] = f'attachment; filename="{file_obj.original_name}"'
                
                # Clean up decrypted file after sending
                response._resource_closers.append(lambda: os.remove(decrypted_path))
                
                return response
            else:
                # Serve unencrypted file
                response = FileResponse(file_obj.file_path)
                response['Content-Disposition'] = f'attachment; filename="{file_obj.original_name}"'
                return response
            
        except File.DoesNotExist:
            return Response(
                {'error': 'File not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error downloading file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FileAccessLogView(generics.ListAPIView):
    """View file access logs"""
    serializer_class = FileAccessLogSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return FileAccessLog.objects.all().order_by('-access_time')


class FilePermissionView(generics.ListCreateAPIView):
    """Manage file permissions"""
    serializer_class = FilePermissionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return FilePermission.objects.all().order_by('-granted_at')
    
    def perform_create(self, serializer):
        serializer.save(granted_by=self.request.user)


class RemoteAccessRequestView(generics.ListCreateAPIView):
    """Handle remote access requests"""
    serializer_class = RemoteAccessRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return RemoteAccessRequest.objects.all().order_by('-requested_at')
        return RemoteAccessRequest.objects.filter(user=self.request.user).order_by('-requested_at')
    
    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            requested_from_ip=self.request.META.get('REMOTE_ADDR', ''),
            requested_location=self.request.data.get('location', 'Unknown')
        )
        
        # Log activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='REMOTE_REQUEST',
            description='Submitted remote access request',
            ip_address=self.request.META.get('REMOTE_ADDR', ''),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )


class AdminApproveRemoteAccessView(APIView):
    """Approve or reject remote access requests"""
    permission_classes = [IsAdminUser]

    def post(self, request, request_id):
        try:
            remote_request = RemoteAccessRequest.objects.get(id=request_id)
            action = request.data.get('action')  # 'approve' or 'reject'
            days = int(request.data.get('days', 7))
            
            if action == 'approve':
                remote_request.status = 'APPROVED'
                remote_request.approved_by = request.user
                remote_request.approved_at = timezone.now()
                remote_request.expiry_date = timezone.now() + timedelta(days=days)
                remote_request.save()
                
                # Enable remote access for user
                user = remote_request.user
                user.is_remote_access_enabled = True
                user.remote_access_expiry = remote_request.expiry_date
                user.save()
                
                # Send approval email
                send_mail(
                    'Remote Access Approved - GeoCrypt',
                    f'Your remote access request has been approved.\n'
                    f'Remote access will be available until {remote_request.expiry_date}.',
                    'noreply@geocrypt.com',
                    [user.email],
                    fail_silently=False,
                )
                
                return Response({'message': 'Remote access approved'})
            
            elif action == 'reject':
                remote_request.status = 'REJECTED'
                remote_request.approved_by = request.user
                remote_request.approved_at = timezone.now()
                remote_request.save()
                
                return Response({'message': 'Remote access rejected'})
            
            else:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except RemoteAccessRequest.DoesNotExist:
            return Response(
                {'error': 'Request not found'},
                status=status.HTTP_404_NOT_FOUND
            )