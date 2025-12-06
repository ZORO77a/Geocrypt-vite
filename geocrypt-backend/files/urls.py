from django.urls import path
from . import views

urlpatterns = [
    # File operations
    path('files/', views.FileListView.as_view(), name='file-list'),
    path('files/upload/', views.FileUploadView.as_view(), name='file-upload'),
    path('files/<int:file_id>/download/', views.FileDownloadView.as_view(), name='file-download'),
    
    # File permissions
    path('permissions/', views.FilePermissionView.as_view(), name='file-permissions'),
    
    # Access logs
    path('access-logs/', views.FileAccessLogView.as_view(), name='access-logs'),
    
    # Remote access requests
    path('remote-requests/', views.RemoteAccessRequestView.as_view(), name='remote-requests'),
    path('remote-requests/<int:request_id>/approve/', views.AdminApproveRemoteAccessView.as_view(), name='approve-remote-request'),
]