from django.shortcuts import render

# Create your views here.
from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.db.models import Count, Q
from datetime import datetime, timedelta

from .models import UserActivity, SuspiciousActivity, UserBehaviorProfile
from .serializers import (UserActivitySerializer, SuspiciousActivitySerializer,
                         UserBehaviorProfileSerializer)
from .anomaly_detection import AnomalyDetector, BehaviorAnalyzer


class UserActivityListView(generics.ListAPIView):
    """List all user activities"""
    serializer_class = UserActivitySerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = UserActivity.objects.all().order_by('-timestamp')
        
        # Filter by user if provided
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by activity type
        activity_type = self.request.query_params.get('activity_type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(
                timestamp__date__range=[start_date, end_date]
            )
        
        return queryset


class UserActivityDetailView(views.APIView):
    """Get detailed analytics for a user"""
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        # Get time range (default: last 30 days)
        days = int(request.query_params.get('days', 30))
        start_date = datetime.now() - timedelta(days=days)
        
        # Get user activities
        activities = UserActivity.objects.filter(
            user_id=user_id,
            timestamp__gte=start_date
        ).order_by('timestamp')
        
        # Calculate statistics
        total_activities = activities.count()
        activity_types = activities.values('activity_type').annotate(
            count=Count('activity_type')
        ).order_by('-count')
        
        # Daily activity count
        daily_counts = activities.extra(
            {'date': "date(timestamp)"}
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # Most active hours
        hourly_counts = activities.extra(
            {'hour': "EXTRACT(hour FROM timestamp)"}
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        return Response({
            'user_id': user_id,
            'time_period': f'Last {days} days',
            'total_activities': total_activities,
            'activity_types': list(activity_types),
            'daily_activity': list(daily_counts),
            'hourly_pattern': list(hourly_counts)
        })


class SuspiciousActivityListView(generics.ListAPIView):
    """List suspicious activities"""
    serializer_class = SuspiciousActivitySerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = SuspiciousActivity.objects.all().order_by('-detected_at')
        
        # Filter by severity
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by resolution status
        resolved = self.request.query_params.get('resolved')
        if resolved:
            resolved_bool = resolved.lower() == 'true'
            queryset = queryset.filter(is_resolved=resolved_bool)
        
        return queryset


class ResolveSuspiciousActivityView(views.APIView):
    """Resolve a suspicious activity"""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            activity = SuspiciousActivity.objects.get(id=pk)
            resolution_notes = request.data.get('resolution_notes', '')
            
            activity.is_resolved = True
            activity.resolved_at = datetime.now()
            activity.resolved_by = request.user
            activity.resolution_notes = resolution_notes
            activity.save()
            
            return Response({'message': 'Activity marked as resolved'})
        except SuspiciousActivity.DoesNotExist:
            return Response(
                {'error': 'Activity not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserBehaviorProfileListView(generics.ListAPIView):
    """List all user behavior profiles"""
    serializer_class = UserBehaviorProfileSerializer
    permission_classes = [IsAdminUser]
    queryset = UserBehaviorProfile.objects.all().order_by('-updated_at')


class UserBehaviorProfileDetailView(views.APIView):
    """Get or create behavior profile for a user"""
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        try:
            profile = UserBehaviorProfile.objects.get(user_id=user_id)
            return Response(UserBehaviorProfileSerializer(profile).data)
        except UserBehaviorProfile.DoesNotExist:
            # Create profile with basic analysis
            from accounts.models import User
            from .anomaly_detection import BehaviorAnalyzer
            
            try:
                user = User.objects.get(id=user_id)
                analyzer = BehaviorAnalyzer()
                
                # Get user activities for analysis
                activities = UserActivity.objects.filter(user=user)
                behavior_data = analyzer.analyze_user_behavior(user, activities)
                
                profile = UserBehaviorProfile.objects.create(
                    user=user,
                    avg_login_time=behavior_data.get('avg_login_time'),
                    avg_logout_time=behavior_data.get('avg_logout_time'),
                    typical_access_locations=behavior_data.get('typical_locations', []),
                    avg_files_accessed_per_day=behavior_data.get('files_accessed_per_day', 0)
                )
                
                return Response(UserBehaviorProfileSerializer(profile).data)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )


class TrainAnomalyDetectorView(views.APIView):
    """Train the anomaly detection model"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        from .anomaly_detection import AnomalyDetector
        
        # Get training data (all activities from last 90 days)
        days = int(request.data.get('days', 90))
        start_date = datetime.now() - timedelta(days=days)
        
        activities = UserActivity.objects.filter(
            timestamp__gte=start_date
        ).order_by('timestamp')
        
        if activities.count() < 100:
            return Response({
                'error': 'Insufficient data for training',
                'available_records': activities.count(),
                'minimum_required': 100
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Train the model
        detector = AnomalyDetector()
        success = detector.train(activities)
        
        if success:
            return Response({
                'message': 'Anomaly detector trained successfully',
                'training_samples': activities.count(),
                'model_saved': True
            })
        else:
            return Response({
                'error': 'Failed to train anomaly detector'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)