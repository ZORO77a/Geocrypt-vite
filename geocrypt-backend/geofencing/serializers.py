from rest_framework import serializers
from .models import AllowedLocation, AllowedWifi, WorkHours, AccessRule, UserAccessLog


class AllowedLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllowedLocation
        fields = ['id', 'name', 'latitude', 'longitude', 'radius_km', 'is_active']


class AllowedWifiSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)

    class Meta:
        model = AllowedWifi
        fields = ['id', 'location', 'location_name', 'ssid', 'bssid', 'is_active']


class WorkHoursSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_display', read_only=True)

    class Meta:
        model = WorkHours
        fields = ['id', 'day', 'day_name', 'start_time', 'end_time', 'is_active']


class AccessRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessRule
        fields = ['id', 'name', 'require_location', 'require_wifi', 'require_time', 'is_default']


class UserAccessLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = UserAccessLog
        fields = ['id', 'user', 'user_name', 'access_time', 'latitude', 'longitude',
                 'ip_address', 'wifi_ssid', 'wifi_bssid', 'access_granted', 
                 'reason', 'is_suspicious']