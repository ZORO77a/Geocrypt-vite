from geopy.distance import geodesic
from datetime import datetime, time
from django.utils import timezone
from django.conf import settings


def check_location_access(latitude, longitude):
    """
    Check if the given coordinates are within any allowed location
    """
    allowed_locations = settings.ALLOWED_LOCATIONS
    
    for location in allowed_locations:
        point1 = (float(latitude), float(longitude))
        point2 = (location['latitude'], location['longitude'])
        
        distance = geodesic(point1, point2).kilometers
        
        if distance <= location['radius_km']:
            return {
                'allowed': True,
                'location_name': location['name'],
                'distance_km': distance
            }
    
    return {
        'allowed': False,
        'reason': 'Location not within allowed areas'
    }


def check_wifi_access(wifi_ssid, location_name=None):
    """
    Check if the WiFi SSID is allowed
    """
    allowed_locations = settings.ALLOWED_LOCATIONS
    
    if location_name:
        # Check for specific location
        for location in allowed_locations:
            if location['name'] == location_name:
                if wifi_ssid in location['allowed_wifi_ssids']:
                    return {
                        'allowed': True,
                        'location_name': location_name
                    }
    else:
        # Check all locations
        for location in allowed_locations:
            if wifi_ssid in location['allowed_wifi_ssids']:
                return {
                    'allowed': True,
                    'location_name': location['name']
                }
    
    return {
        'allowed': False,
        'reason': f'WiFi network "{wifi_ssid}" not allowed'
    }


def check_time_access():
    """
    Check if current time is within work hours
    """
    now = timezone.now()
    current_time = now.time()
    current_hour = current_time.hour
    
    # Default work hours from settings
    work_start = getattr(settings, 'WORK_HOURS_START', 9)
    work_end = getattr(settings, 'WORK_HOURS_END', 17)
    
    if work_start <= current_hour < work_end:
        return {
            'allowed': True,
            'current_time': current_time.strftime('%H:%M:%S')
        }
    
    return {
        'allowed': False,
        'reason': f'Access allowed only between {work_start}:00 and {work_end}:00',
        'current_time': current_time.strftime('%H:%M:%S')
    }


def validate_access_conditions(user, latitude=None, longitude=None, wifi_ssid=None):
    """
    Validate all access conditions for a user
    """
    results = {
        'overall_access': True,
        'checks': {},
        'reasons': []
    }
    
    # Check if remote access is enabled
    if user.is_remote_access_enabled and user.remote_access_expiry:
        if timezone.now() < user.remote_access_expiry:
            results['checks']['remote_access'] = {
                'allowed': True,
                'reason': 'Remote access granted'
            }
            return results
    
    # Check location
    if latitude and longitude:
        location_check = check_location_access(latitude, longitude)
        results['checks']['location'] = location_check
        if not location_check['allowed']:
            results['overall_access'] = False
            results['reasons'].append(location_check['reason'])
    else:
        results['checks']['location'] = {
            'allowed': False,
            'reason': 'Location data not provided'
        }
        results['overall_access'] = False
        results['reasons'].append('Location data not provided')
    
    # Check WiFi
    if wifi_ssid:
        wifi_check = check_wifi_access(wifi_ssid)
        results['checks']['wifi'] = wifi_check
        if not wifi_check['allowed']:
            results['overall_access'] = False
            results['reasons'].append(wifi_check['reason'])
    else:
        results['checks']['wifi'] = {
            'allowed': False,
            'reason': 'WiFi data not provided'
        }
        results['overall_access'] = False
        results['reasons'].append('WiFi data not provided')
    
    # Check time
    time_check = check_time_access()
    results['checks']['time'] = time_check
    if not time_check['allowed']:
        results['overall_access'] = False
        results['reasons'].append(time_check['reason'])
    
    return results