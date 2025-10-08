"""
Face recognition service
"""
import face_recognition
import numpy as np
from PIL import Image
import base64
import io
import os
from datetime import datetime

class FaceRecognitionService:
    """Service for face recognition operations"""
    
    @staticmethod
    def encode_face_from_base64(image_data):
        """
        Extract face encoding from base64 image data
        Returns: (face_encoding, error_message)
        """
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            image_rgb = np.array(image)
            
            # Get face encodings
            face_encodings = face_recognition.face_encodings(image_rgb)
            
            if len(face_encodings) == 0:
                return None, "Không tìm thấy khuôn mặt trong ảnh!"
            
            return face_encodings[0], None
            
        except Exception as e:
            return None, f"Lỗi xử lý ảnh: {str(e)}"
    
    @staticmethod
    def save_face_image(image_data, employee_id):
        """
        Save face image to file system
        Returns: (image_path, error_message)
        """
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Create filename and path
            image_filename = f"{employee_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            image_path = os.path.join('face_images', image_filename)
            
            # Ensure directory exists
            os.makedirs('face_images', exist_ok=True)
            
            # Save image
            image.save(image_path)
            
            return image_path, None
            
        except Exception as e:
            return None, f"Lỗi lưu ảnh: {str(e)}"
    
    @staticmethod
    def recognize_face(image_data, users):
        """
        Recognize face from image data against list of users
        Returns: (found_user, confidence, error_message)
        """
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            image_rgb = np.array(image)
            
            # Find face encodings in image
            face_locations = face_recognition.face_locations(image_rgb)
            face_encodings = face_recognition.face_encodings(image_rgb, face_locations)
            
            if len(face_encodings) == 0:
                return None, 0, "Không tìm thấy khuôn mặt trong ảnh!"
            
            # Prepare stored encodings
            stored_encodings = []
            user_list = []
            
            for user in users:
                try:
                    stored_encoding = np.array([float(x) for x in user.face_encoding.split(',')])
                    stored_encodings.append(stored_encoding)
                    user_list.append(user)
                except Exception as e:
                    print(f"Error processing user {user.name}: {str(e)}")
                    continue
            
            if not stored_encodings:
                return None, 0, "Không có dữ liệu khuôn mặt nào trong hệ thống!"
            
            # Find best match
            found_user = None
            best_match_distance = float('inf')
            
            for face_encoding in face_encodings:
                face_distances = face_recognition.face_distance(stored_encodings, face_encoding)
                min_distance_index = np.argmin(face_distances)
                min_distance = face_distances[min_distance_index]
                
                # Threshold for face recognition
                if min_distance < 0.6 and min_distance < best_match_distance:
                    found_user = user_list[min_distance_index]
                    best_match_distance = min_distance
            
            if found_user:
                confidence = max(0, (1 - best_match_distance) * 100)  # Convert to percentage
                return found_user, confidence, None
            else:
                return None, 0, "Không nhận diện được khuôn mặt! Vui lòng đăng ký trước."
                
        except Exception as e:
            return None, 0, f"Lỗi nhận diện: {str(e)}"
    
    @staticmethod
    def get_face_comparison_details(image_data, users):
        """
        Get detailed comparison results for debugging
        Returns: comparison_results
        """
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            image_rgb = np.array(image)
            
            # Find face encodings
            face_locations = face_recognition.face_locations(image_rgb)
            face_encodings = face_recognition.face_encodings(image_rgb, face_locations)
            
            result = {
                'faces_detected': len(face_encodings),
                'face_locations': face_locations,
                'total_users_in_db': len(users),
                'comparison_results': []
            }
            
            if len(face_encodings) > 0:
                for i, face_encoding in enumerate(face_encodings):
                    face_result = {
                        'face_index': i,
                        'matches': []
                    }
                    
                    for user in users:
                        try:
                            stored_encoding = np.array([float(x) for x in user.face_encoding.split(',')])
                            distance = face_recognition.face_distance([stored_encoding], face_encoding)[0]
                            is_match = distance < 0.6
                            
                            face_result['matches'].append({
                                'user_name': user.name,
                                'employee_id': user.employee_id,
                                'distance': round(float(distance), 3),
                                'is_match': is_match
                            })
                        except Exception as e:
                            face_result['matches'].append({
                                'user_name': user.name,
                                'employee_id': user.employee_id,
                                'error': str(e)
                            })
                    
                    # Sort by distance
                    face_result['matches'].sort(key=lambda x: x.get('distance', float('inf')))
                    result['comparison_results'].append(face_result)
            
            return result
            
        except Exception as e:
            return {'error': str(e)}