from rest_framework import serializers
from .models import UserActivity, SuspiciousActivity, UserBehaviorProfile


class UserActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = UserActivity
        fields = ['id', 'user', 'user_name', 'activity_type', 'description',
                 'ip_address', 'user_agent', 'timestamp', 'metadata']


class SuspiciousActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, allow_null=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = SuspiciousActivity
        fields = ['id', 'user', 'user_name', 'activity', 'description',
                 'severity', 'detected_at', 'is_resolved', 'resolved_at',
                 'resolved_by', 'resolved_by_name', 'resolution_notes']


class UserBehaviorProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserBehaviorProfile
        fields = ['id', 'user', 'user_name', 'user_email', 'avg_login_time',
                 'avg_logout_time', 'typical_access_locations', 
                 'typical_wifi_networks', 'avg_files_accessed_per_day',
                 'created_at', 'updated_at']