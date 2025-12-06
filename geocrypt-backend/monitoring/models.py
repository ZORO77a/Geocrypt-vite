

# Create your models here.
from django.db import models
from django.conf import settings


class UserActivity(models.Model):
    ACTIVITY_CHOICES = [
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('FILE_ACCESS', 'File Access'),
        ('FILE_UPLOAD', 'File Upload'),
        ('FILE_DOWNLOAD', 'File Download'),
        ('FILE_DELETE', 'File Delete'),
        ('REMOTE_REQUEST', 'Remote Access Request'),
        ('PROFILE_UPDATE', 'Profile Update'),
        ('PASSWORD_CHANGE', 'Password Change'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_CHOICES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']


class SuspiciousActivity(models.Model):
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    activity = models.ForeignKey(UserActivity, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    detected_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, 
                                   on_delete=models.SET_NULL, 
                                   null=True, 
                                   related_name='resolved_activities')
    resolution_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-detected_at']


class UserBehaviorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    avg_login_time = models.TimeField(null=True, blank=True)
    avg_logout_time = models.TimeField(null=True, blank=True)
    typical_access_locations = models.JSONField(default=list, blank=True)
    typical_wifi_networks = models.JSONField(default=list, blank=True)
    avg_files_accessed_per_day = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Behavior Profile for {self.user.email}"


class AnomalyDetectionModel(models.Model):
    name = models.CharField(max_length=100)
    model_type = models.CharField(max_length=50)
    version = models.CharField(max_length=20)
    accuracy = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    model_file = models.FileField(upload_to='ml_models/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} v{self.version}"