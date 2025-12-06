from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, OTP, LoginSession
import pyotp
from datetime import datetime, timedelta


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'employee_id', 'first_name', 'last_name', 
                 'department', 'position', 'phone_number', 'is_active',
                 'is_approved', 'is_remote_access_enabled', 'remote_access_expiry',
                 'created_at']
        read_only_fields = ['created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'employee_id', 'first_name', 'last_name', 
                 'department', 'position', 'phone_number', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            employee_id=validated_data.get('employee_id', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            department=validated_data.get('department', ''),
            position=validated_data.get('position', ''),
            phone_number=validated_data.get('phone_number', ''),
            is_approved=False  # Admin needs to approve
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), 
                              email=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include "email" and "password".')
        
        return data


class OTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get('email')
        otp = data.get('otp')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found.')

        try:
            otp_record = OTP.objects.filter(
                user=user,
                otp_code=otp,
                is_used=False,
                expires_at__gt=timezone.now()
            ).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired OTP.')

        data['user'] = user
        data['otp_record'] = otp_record
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords don't match.")
        return data


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginSession
        fields = ['id', 'ip_address', 'login_time', 'logout_time', 'is_active']