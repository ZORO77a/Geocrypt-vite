from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings


class AllowedLocation(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_km = models.DecimalField(max_digits=5, decimal_places=2, default=0.1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class AllowedWifi(models.Model):
    location = models.ForeignKey(AllowedLocation, on_delete=models.CASCADE, related_name='allowed_wifis')
    ssid = models.CharField(max_length=100)
    bssid = models.CharField(max_length=100, blank=True)  # MAC address of AP
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['location', 'ssid']


class WorkHours(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    day = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['day']
        unique_together = ['day']


class AccessRule(models.Model):
    name = models.CharField(max_length=100)
    require_location = models.BooleanField(default=True)
    require_wifi = models.BooleanField(default=True)
    require_time = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserAccessLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    access_time = models.DateTimeField(auto_now_add=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    wifi_ssid = models.CharField(max_length=100, blank=True)
    wifi_bssid = models.CharField(max_length=100, blank=True)
    access_granted = models.BooleanField(default=False)
    reason = models.TextField(blank=True)
    is_suspicious = models.BooleanField(default=False)

    class Meta:
        ordering = ['-access_time']