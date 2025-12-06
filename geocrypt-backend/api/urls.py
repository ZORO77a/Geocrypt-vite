from django.urls import path, include

urlpatterns = [
    path('auth/', include('accounts.urls')),
    path('files/', include('files.urls')),
    path('geofencing/', include('geofencing.urls')),
    path('monitoring/', include('monitoring.urls')),
]