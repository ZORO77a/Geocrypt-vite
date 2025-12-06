from django.shortcuts import render

# Create your views here.
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate, logout
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import pyotp
import secrets

from .models import User, OTP, LoginSession
from .serializers import (UserSerializer, UserCreateSerializer, 
                         LoginSerializer, OTPSerializer, 
                         ChangePasswordSerializer, SessionSerializer)
from monitoring.models import UserActivity


class AdminOnly(permissions.BasePermission):
    """Permission check for admin users"""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class UserLoginView(APIView):
    """Handle user login with OTP"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate OTP
            totp = pyotp.TOTP(pyotp.random_base32(), interval=300)  # 5 minutes
            otp_code = totp.now()
            
            # Save OTP to database
            expires_at = timezone.now() + timedelta(minutes=5)
            otp_record = OTP.objects.create(
                user=user,
                otp_code=otp_code,
                expires_at=expires_at
            )
            
            # Send OTP via email
            try:
                send_mail(
                    'Your GeoCrypt Login OTP',
                    f'Your OTP for login is: {otp_code}\nThis OTP will expire in 5 minutes.',
                    'noreply@geocrypt.com',
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({
                    'error': 'Failed to send OTP email',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='LOGIN',
                description='Login attempt initiated',
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'message': 'OTP sent to your email',
                'email': user.email,
                'otp_id': otp_record.id
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    """Verify OTP and complete login"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            otp_record = serializer.validated_data['otp_record']
            
            # Mark OTP as used
            otp_record.is_used = True
            otp_record.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Create login session
            session_token = secrets.token_urlsafe(32)
            LoginSession.objects.create(
                user=user,
                session_token=session_token,
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Log successful login
            UserActivity.objects.create(
                user=user,
                activity_type='LOGIN',
                description='Successful login with OTP',
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'session_token': session_token
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """Handle user logout"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Invalidate session
        session_token = request.data.get('session_token')
        if session_token:
            try:
                session = LoginSession.objects.get(
                    session_token=session_token,
                    user=request.user,
                    is_active=True
                )
                session.is_active = False
                session.logout_time = timezone.now()
                session.save()
            except LoginSession.DoesNotExist:
                pass
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='LOGOUT',
            description='User logged out',
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'message': 'Logout successful'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Current password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='PASSWORD_CHANGE',
                description='Password changed successfully',
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({'message': 'Password updated successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Admin Views
class AdminUserListView(generics.ListCreateAPIView):
    """List all users (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin user management"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class AdminApproveUserView(APIView):
    """Approve user account (admin only)"""
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_approved = True
            user.save()
            
            # Send approval email
            send_mail(
                'Account Approved - GeoCrypt',
                f'Your account has been approved by the administrator.\nYou can now login to the system.',
                'noreply@geocrypt.com',
                [user.email],
                fail_silently=False,
            )
            
            return Response({'message': 'User approved successfully'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminEnableRemoteAccessView(APIView):
    """Enable remote access for user (admin only)"""
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            days = int(request.data.get('days', 7))
            
            user.is_remote_access_enabled = True
            user.remote_access_expiry = timezone.now() + timedelta(days=days)
            user.save()
            
            return Response({
                'message': f'Remote access enabled for {days} days',
                'expiry_date': user.remote_access_expiry
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )