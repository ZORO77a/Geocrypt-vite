from django.urls import path
from . import views

urlpatterns = [
    # Activity monitoring
    path('activities/', views.UserActivityListView.as_view(), name='activity-list'),
    path('activities/user/<int:user_id>/', views.UserActivityDetailView.as_view(), name='user-activities'),
    
    # Suspicious activities
    path('suspicious/', views.SuspiciousActivityListView.as_view(), name='suspicious-list'),
    path('suspicious/<int:pk>/resolve/', views.ResolveSuspiciousActivityView.as_view(), name='resolve-suspicious'),
    
    # Behavior profiles
    path('behavior-profiles/', views.UserBehaviorProfileListView.as_view(), name='behavior-profiles'),
    path('behavior-profiles/<int:user_id>/', views.UserBehaviorProfileDetailView.as_view(), name='user-behavior-profile'),
    
    # AI training
    path('train-anomaly-detector/', views.TrainAnomalyDetectorView.as_view(), name='train-anomaly-detector'),
]