from rest_framework import serializers
from .models import File, FileAccessLog, FilePermission, RemoteAccessRequest
import os


class FileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    can_access = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'name', 'original_name', 'file_path', 'file_size', 
                 'file_size_mb', 'mime_type', 'is_encrypted', 'uploaded_by',
                 'uploaded_by_name', 'uploaded_at', 'last_accessed', 
                 'access_count', 'can_access']
        read_only_fields = ['uploaded_at', 'last_accessed', 'access_count']

    def get_file_size_mb(self, obj):
        return round(obj.file_size / (1024 * 1024), 2)

    def get_can_access(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.filepermission_set.filter(user=request.user, is_active=True).exists()
        return False


class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['name', 'file_path']
    
    def validate_file_path(self, value):
        # Validate file size (max 100MB)
        max_size = 100 * 1024 * 1024  # 100MB
        if value.size > max_size:
            raise serializers.ValidationError(f'File size must be less than 100MB.')
        
        # Validate file extension
        allowed_extensions = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.ppt', '.pptx']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f'File type not allowed. Allowed types: {allowed_extensions}')
        
        return value


class FileAccessLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    file_name = serializers.CharField(source='file.name', read_only=True)

    class Meta:
        model = FileAccessLog
        fields = ['id', 'user', 'user_name', 'file', 'file_name', 'access_type',
                 'access_time', 'ip_address', 'location', 'wifi_ssid',
                 'access_status', 'reason', 'is_suspicious']
        read_only_fields = ['access_time']


class FilePermissionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    file_name = serializers.CharField(source='file.name', read_only=True)
    granted_by_name = serializers.CharField(source='granted_by.get_full_name', read_only=True)

    class Meta:
        model = FilePermission
        fields = ['id', 'user', 'user_name', 'file', 'file_name', 
                 'permission_type', 'granted_by', 'granted_by_name',
                 'granted_at', 'expires_at', 'is_active']


class RemoteAccessRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = RemoteAccessRequest
        fields = ['id', 'user', 'user_name', 'reason', 'requested_from_ip',
                 'requested_location', 'requested_at', 'status', 'approved_by',
                 'approved_by_name', 'approved_at', 'expiry_date']
        read_only_fields = ['requested_at', 'approved_at']