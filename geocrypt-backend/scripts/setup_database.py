#!/usr/bin/env python
"""
Complete Database Setup Script for GeoCrypt
Run: python setup_database.py
IMPORTANT: Update the email addresses below with YOUR email!
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_database():
    """Complete database setup with migrations and initial data"""
    
    print("=" * 70)
    print("🚀 GeoCrypt Database Setup")
    print("=" * 70)
    
    # ============================================================
    # ⚠️ IMPORTANT: CHANGE THESE EMAILS TO YOUR EMAILS! ⚠️
    # ============================================================
    
    # Your admin email (where you'll receive OTPs)
    YOUR_ADMIN_EMAIL = "ananthakrishnan272004@gmail.com"  # ← CHANGE THIS!
    
    # Your employee email (for testing employee login)
    YOUR_EMPLOYEE_EMAIL = "aswinanaik2103@gmail.com"  # ← CHANGE THIS or use same as above
    
    # ============================================================
    
    # Set up Django environment
    # Ensure project root is on sys.path so Django can import project modules
    PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if PROJECT_ROOT not in sys.path:
        sys.path.insert(0, PROJECT_ROOT)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geocrypt.settings')
    django.setup()
    
    try:
        print("\n📦 Step 1: Creating all migrations...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        
        print("\n📦 Step 2: Applying migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("\n👑 Step 3: Creating super admin user...")
        from accounts.models import User
        
        admin_password = 'Admin@123'  # You can change this
        
        if User.objects.filter(email=YOUR_ADMIN_EMAIL).exists():
            admin_user = User.objects.get(email=YOUR_ADMIN_EMAIL)
            print(f"✓ Admin user already exists: {YOUR_ADMIN_EMAIL}")
        else:
            try:
                admin_user = User.objects.create_superuser(
                    email=YOUR_ADMIN_EMAIL,
                    password=admin_password,
                    employee_id='ADMIN001',
                    first_name='System',
                    last_name='Administrator',
                    department='IT',
                    position='System Admin',
                    phone_number='+1234567890',
                    is_approved=True
                )
                print(f"✓ Admin user created successfully!")
            except Exception as e:
                # If create_superuser fails, try alternative
                admin_user = User.objects.create(
                    email=YOUR_ADMIN_EMAIL,
                    employee_id='ADMIN001',
                    first_name='System',
                    last_name='Administrator',
                    department='IT',
                    position='System Admin',
                    phone_number='+1234567890',
                    is_staff=True,
                    is_superuser=True,
                    is_active=True,
                    is_approved=True
                )
                admin_user.set_password(admin_password)
                admin_user.save()
                print(f"✓ Admin user created (alternative method)")
        
        print(f"\n   📧 Email: {YOUR_ADMIN_EMAIL}")
        print(f"   🔑 Password: {admin_password}")
        print(f"   🆔 Employee ID: ADMIN001")
        
        print("\n⚙️ Step 4: Setting up default work hours...")
        from geofencing.models import WorkHours
        
        work_hours = [
            (0, '00:00', '23:59'),  # Monday
            (1, '00:00', '23:59'),  # Tuesday
            (2, '00:00', '23:59'),  # Wednesday
            (3, '00:00', '23:59'),  # Thursday
            (4, '00:00', '23:59'),  # Friday
            (5, '00:00', '23:59'),  # Saturday (half day)
            (6, '00:00', '23:59'),  # Sunday (closed)
        ]
        
        for day, start, end in work_hours:
            WorkHours.objects.get_or_create(
                day=day,
                defaults={'start_time': start, 'end_time': end, 'is_active': True}
            )
        print("✓ Default work hours created")
        
        print("\n📍 Step 5: Creating default locations...")
        from geofencing.models import AllowedLocation, AllowedWifi
        
        # Create main office location
        location, created = AllowedLocation.objects.get_or_create(
            name='Main Office',
            defaults={
                'latitude': 9.358667261002742,
                'longitude': 76.67729687183018,
                'radius_km': 1.0,
                'is_active': True
            }
        )
        
        if created:
            # Add allowed WiFi networks
            AllowedWifi.objects.create(location=location, ssid='GNXS-92f598')
            AllowedWifi.objects.create(location=location, ssid='Company-Secure')
            print("✓ Default location and WiFi networks created")
        else:
            print("✓ Default location already exists")
        
        print("\n🔐 Step 6: Creating default access rules...")
        from geofencing.models import AccessRule
        
        AccessRule.objects.get_or_create(
            name='Default Office Access',
            defaults={
                'require_location': True,
                'require_wifi': True,
                'require_time': True,
                'is_default': True
            }
        )
        print("✓ Default access rules created")
        
        print("\n👥 Step 7: Creating test employees...")
        test_users = [
            {
                'email': YOUR_EMPLOYEE_EMAIL,  # Your employee email
                'password': 'Employee@123',
                'employee_id': 'EMP001',
                'first_name': 'John',
                'last_name': 'Doe',
                'department': 'Sales',
                'position': 'Sales Executive',
                'is_staff': False,
            },
            {
                'email': 'arjuns200425@gmail.com',
                'password': 'Manager@123',
                'employee_id': 'MGR001',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'department': 'Management',
                'position': 'Project Manager',
                'is_staff': True,
            },
            {
                'email': 'arjunbpanicker2004@gmail.com',
                'password': 'Developer@123',
                'employee_id': 'DEV001',
                'first_name': 'Alex',
                'last_name': 'Johnson',
                'department': 'IT',
                'position': 'Software Developer',
                'is_staff': False,
            }
        ]
        
        for user_data in test_users:
            try:
                user, created = User.objects.get_or_create(
                    email=user_data['email'],
                    defaults={
                        'employee_id': user_data['employee_id'],
                        'first_name': user_data['first_name'],
                        'last_name': user_data['last_name'],
                        'department': user_data['department'],
                        'position': user_data['position'],
                        'is_staff': user_data.get('is_staff', False),
                        'is_approved': True
                    }
                )
                
                if created:
                    user.set_password(user_data['password'])
                    user.save()
                    print(f"   ✓ Created: {user.email} ({user.employee_id})")
                else:
                    print(f"   → Already exists: {user.email}")
            except Exception as e:
                print(f"   ✗ Error creating {user_data['email']}: {str(e)}")
        
        print("\n" + "=" * 70)
        print("✅ SETUP COMPLETE!")
        print("=" * 70)
        
        print("\n📋 NEXT STEPS:")
        print("1. 🚀 Start server: python manage.py runserver")
        print("2. 🌐 Access admin: http://localhost:8000/admin")
        print(f"3. 🔐 Login with: {YOUR_ADMIN_EMAIL} / Admin@123")
        print("4. 📧 Test OTP: Make sure email is configured in .env")
        print("5. 🧪 Test APIs: Use Postman or frontend")
        
        print("\n📞 CREDENTIALS SUMMARY:")
        print(f"   Admin: {YOUR_ADMIN_EMAIL} / Admin@123")
        print(f"   Employee: {YOUR_EMPLOYEE_EMAIL} / Employee@123")
        print("   Manager: manager@company.com / Manager@123")
        print("   Developer: developer@company.com / Developer@123")
        
        return True
        
    except Exception as e:
        print(f"\n❌ SETUP FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = setup_database()
    sys.exit(0 if success else 1)