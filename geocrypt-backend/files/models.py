

# Create your models here.
from django.db import models
from django.conf import settings
import os
from cryptography.fernet import Fernet
import base64


class File(models.Model):
    name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='encrypted_files/')
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    is_encrypted = models.BooleanField(default=True)
    encryption_key = models.BinaryField()  # Store encrypted key
    iv = models.BinaryField(null=True, blank=True)  # Initialization vector
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, 
                                   on_delete=models.SET_NULL, 
                                   null=True, 
                                   related_name='uploaded_files')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    access_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-uploaded_at']


class FileAccessLog(models.Model):
    ACCESS_CHOICES = [
        ('VIEW', 'View'),
        ('DOWNLOAD', 'Download'),
        ('DECRYPT', 'Decrypt'),
        ('ENCRYPT', 'Encrypt'),
    ]

    STATUS_CHOICES = [
        ('GRANTED', 'Access Granted'),
        ('DENIED', 'Access Denied'),
        ('PENDING', 'Pending'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    access_type = models.CharField(max_length=20, choices=ACCESS_CHOICES)
    access_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    location = models.CharField(max_length=255, blank=True)
    wifi_ssid = models.CharField(max_length=100, blank=True)
    access_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    reason = models.TextField(blank=True)
    is_suspicious = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.file.name} - {self.access_status}"

    class Meta:
        ordering = ['-access_time']


class FilePermission(models.Model):
    PERMISSION_CHOICES = [
        ('READ', 'Read Only'),
        ('WRITE', 'Read and Write'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    permission_type = models.CharField(max_length=10, choices=PERMISSION_CHOICES)
    granted_by = models.ForeignKey(settings.AUTH_USER_MODEL, 
                                  on_delete=models.SET_NULL, 
                                  null=True, 
                                  related_name='granted_permissions')
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user', 'file']


class RemoteAccessRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.TextField()
    requested_from_ip = models.GenericIPAddressField()
    requested_location = models.CharField(max_length=255)
    requested_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, 
                                   on_delete=models.SET_NULL, 
                                   null=True, 
                                   related_name='approved_requests')
    approved_at = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Remote access request from {self.user.email}"

    class Meta:
        ordering = ['-requested_at']