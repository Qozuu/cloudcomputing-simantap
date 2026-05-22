import os
import jwt
from flask import request
from functools import wraps
from app.models.user import User
from app.utils.response_helper import error_response

def token_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            # Cek apakah ada token di header Authorization
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]

            if not token:
                return error_response("Token tidak ditemukan! Anda harus login terlebih dahulu.", 401)

            try:
                # Decode token menggunakan SECRET_KEY dari .env
                secret_key = os.getenv('SECRET_KEY', 'secret-default-key-simantap-32bytes-minimum')
                data = jwt.decode(token, secret_key, algorithms=["HS256"])
                current_user = User.query.get(data['user_id'])
                
                if not current_user:
                    return error_response("User tidak ditemukan atau token tidak valid.", 401)
                
                # Cek Hak Akses / Role jika ditentukan
                if allowed_roles and current_user.role not in allowed_roles:
                    return error_response("Akses ditolak! Role Anda tidak memiliki izin ke halaman ini.", 403)
                    
            except jwt.ExpiredSignatureError:
                return error_response("Token sudah kedaluwarsa! Silakan login ulang.", 401)
            except jwt.InvalidTokenError:
                return error_response("Token tidak valid!", 401)

            return f(current_user, *args, **kwargs)
        return decorated
    return decorator