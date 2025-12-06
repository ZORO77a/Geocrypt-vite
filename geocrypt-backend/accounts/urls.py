from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # Admin endpoints
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:user_id>/approve/', views.AdminApproveUserView.as_view(), name='admin-approve-user'),
    path('admin/users/<int:user_id>/enable-remote/', views.AdminEnableRemoteAccessView.as_view(), name='enable-remote-access'),
]