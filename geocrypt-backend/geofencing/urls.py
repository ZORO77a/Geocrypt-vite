from django.urls import path
from . import views

urlpatterns = [
    # Location management
    path('locations/', views.AllowedLocationListCreateView.as_view(), name='location-list'),
    path('locations/<int:pk>/', views.AllowedLocationDetailView.as_view(), name='location-detail'),
    
    # WiFi management
    path('wifi/', views.AllowedWifiListCreateView.as_view(), name='wifi-list'),
    path('wifi/<int:pk>/', views.AllowedWifiDetailView.as_view(), name='wifi-detail'),
    
    # Work hours
    path('work-hours/', views.WorkHoursListCreateView.as_view(), name='work-hours-list'),
    path('work-hours/<int:pk>/', views.WorkHoursDetailView.as_view(), name='work-hours-detail'),
    
    # Access rules
    path('access-rules/', views.AccessRuleListCreateView.as_view(), name='access-rules-list'),
    path('access-rules/<int:pk>/', views.AccessRuleDetailView.as_view(), name='access-rules-detail'),
    
    # Access validation
    path('validate-access/', views.ValidateAccessView.as_view(), name='validate-access'),
]