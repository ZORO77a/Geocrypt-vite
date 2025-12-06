import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, time
import joblib
import os
from django.conf import settings


class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def extract_features(self, user_activities):
        """
        Extract features from user activities for anomaly detection
        """
        features = []
        
        for activity in user_activities:
            # Extract time-based features
            hour = activity.timestamp.hour
            minute = activity.timestamp.minute
            day_of_week = activity.timestamp.weekday()
            
            # Activity type encoding
            activity_types = ['LOGIN', 'LOGOUT', 'FILE_ACCESS', 'FILE_UPLOAD', 
                             'FILE_DOWNLOAD', 'FILE_DELETE', 'REMOTE_REQUEST']
            activity_encoding = [0] * len(activity_types)
            if activity.activity_type in activity_types:
                activity_encoding[activity_types.index(activity.activity_type)] = 1
            
            # Combine features
            feature_vector = [hour, minute, day_of_week] + activity_encoding
            features.append(feature_vector)
        
        return np.array(features)
    
    def train(self, user_activities):
        """
        Train the anomaly detection model
        """
        if len(user_activities) < 10:
            return False
        
        features = self.extract_features(user_activities)
        features_scaled = self.scaler.fit_transform(features)
        self.model.fit(features_scaled)
        self.is_trained = True
        
        # Save the model
        self.save_model()
        return True
    
    def detect(self, user_activity):
        """
        Detect if an activity is anomalous
        """
        if not self.is_trained:
            return False, 0.0
        
        features = self.extract_features([user_activity])
        features_scaled = self.scaler.transform(features)
        
        prediction = self.model.predict(features_scaled)
        anomaly_score = self.model.decision_function(features_scaled)
        
        # -1 means anomaly, 1 means normal
        is_anomaly = prediction[0] == -1
        return is_anomaly, anomaly_score[0]
    
    def save_model(self):
        """Save the trained model"""
        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(model_dir, exist_ok=True)
        
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, os.path.join(model_dir, 'anomaly_detector.pkl'))
    
    def load_model(self):
        """Load a trained model"""
        model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'anomaly_detector.pkl')
        if os.path.exists(model_path):
            data = joblib.load(model_path)
            self.model = data['model']
            self.scaler = data['scaler']
            self.is_trained = True
            return True
        return False


class BehaviorAnalyzer:
    def __init__(self):
        self.user_profiles = {}
    
    def analyze_user_behavior(self, user, activities):
        """
        Analyze user behavior patterns
        """
        if not activities:
            return None
        
        # Calculate average login time
        login_activities = [a for a in activities if a.activity_type == 'LOGIN']
        logout_activities = [a for a in activities if a.activity_type == 'LOGOUT']
        
        avg_login_time = self.calculate_average_time(login_activities)
        avg_logout_time = self.calculate_average_time(logout_activities)
        
        # Count files accessed per day
        file_activities = [a for a in activities if 'FILE' in a.activity_type]
        files_per_day = self.calculate_average_per_day(file_activities)
        
        # Extract locations from metadata
        locations = []
        for activity in activities:
            if 'location' in activity.metadata:
                locations.append(activity.metadata['location'])
        
        return {
            'avg_login_time': avg_login_time,
            'avg_logout_time': avg_logout_time,
            'files_accessed_per_day': files_per_day,
            'typical_locations': list(set(locations))[:5]  # Top 5 locations
        }
    
    def calculate_average_time(self, activities):
        """Calculate average time from activities"""
        if not activities:
            return None
        
        total_seconds = 0
        for activity in activities:
            activity_time = activity.timestamp.time()
            total_seconds += activity_time.hour * 3600 + activity_time.minute * 60 + activity_time.second
        
        avg_seconds = total_seconds / len(activities)
        hours = int(avg_seconds // 3600)
        minutes = int((avg_seconds % 3600) // 60)
        
        return time(hour=hours, minute=minutes)
    
    def calculate_average_per_day(self, activities):
        """Calculate average number of activities per day"""
        if not activities:
            return 0
        
        dates = set(a.timestamp.date() for a in activities)
        if not dates:
            return 0
        
        return len(activities) / len(dates)


def check_suspicious_activity(user_activity, detector, analyzer):
    """
    Check if an activity is suspicious
    """
    suspicious_reasons = []
    
    # Check for anomalies using ML model
    is_anomaly, anomaly_score = detector.detect(user_activity)
    if is_anomaly:
        suspicious_reasons.append(f"Anomalous behavior detected (score: {anomaly_score:.2f})")
    
    # Check for unusual access times
    access_hour = user_activity.timestamp.hour
    if access_hour < 6 or access_hour > 22:  # Outside 6 AM - 10 PM
        suspicious_reasons.append(f"Unusual access time: {access_hour}:00")
    
    # Check for multiple failed logins
    if user_activity.activity_type == 'LOGIN':
        # This would check recent failed login attempts
        pass
    
    return suspicious_reasons