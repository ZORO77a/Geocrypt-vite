from django.shortcuts import render

# Create your views here.
from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.utils import timezone

from .models import AllowedLocation, AllowedWifi, WorkHours, AccessRule, UserAccessLog
from .serializers import (AllowedLocationSerializer, AllowedWifiSerializer,
                         WorkHoursSerializer, AccessRuleSerializer,
                         UserAccessLogSerializer)
from .location_utils import validate_access_conditions


class AllowedLocationListCreateView(generics.ListCreateAPIView):
    """Manage allowed locations"""
    queryset = AllowedLocation.objects.all().order_by('name')
    serializer_class = AllowedLocationSerializer
    permission_classes = [IsAdminUser]


class AllowedLocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Manage specific location"""
    queryset = AllowedLocation.objects.all()
    serializer_class = AllowedLocationSerializer
    permission_classes = [IsAdminUser]


class AllowedWifiListCreateView(generics.ListCreateAPIView):
    """Manage allowed WiFi networks"""
    queryset = AllowedWifi.objects.all().order_by('ssid')
    serializer_class = AllowedWifiSerializer
    permission_classes = [IsAdminUser]


class AllowedWifiDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Manage specific WiFi network"""
    queryset = AllowedWifi.objects.all()
    serializer_class = AllowedWifiSerializer
    permission_classes = [IsAdminUser]


class WorkHoursListCreateView(generics.ListCreateAPIView):
    """Manage work hours"""
    queryset = WorkHours.objects.all().order_by('day')
    serializer_class = WorkHoursSerializer
    permission_classes = [IsAdminUser]


class WorkHoursDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Manage specific work hour setting"""
    queryset = WorkHours.objects.all()
    serializer_class = WorkHoursSerializer
    permission_classes = [IsAdminUser]


class AccessRuleListCreateView(generics.ListCreateAPIView):
    """Manage access rules"""
    queryset = AccessRule.objects.all().order_by('name')
    serializer_class = AccessRuleSerializer
    permission_classes = [IsAdminUser]


class AccessRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Manage specific access rule"""
    queryset = AccessRule.objects.all()
    serializer_class = AccessRuleSerializer
    permission_classes = [IsAdminUser]


class ValidateAccessView(views.APIView):
    """Validate access conditions for a user"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        wifi_ssid = request.data.get('wifi_ssid')
        
        # Validate access conditions
        result = validate_access_conditions(user, latitude, longitude, wifi_ssid)
        
        # Log access attempt
        UserAccessLog.objects.create(
            user=user,
            latitude=latitude,
            longitude=longitude,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            wifi_ssid=wifi_ssid or '',
            access_granted=result['overall_access'],
            reason='; '.join(result['reasons']) if result['reasons'] else 'Access granted',
            is_suspicious=False  # AI monitoring will update this
        )
        
        return Response(result)