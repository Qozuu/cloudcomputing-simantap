import jwt
import os
from flask import request, current_app
from functools import wraps
from app.utils.response_helper import error_response
from app.models.user import User

def token_required(allowed_roles=None):
    if allowed_roles is None:
        allowed_roles = []
        
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            # Cek apakah ada header Authorization di HTTP Request
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    # Format header biasanya: "Bearer <token_jwt>"
                    token = auth_header.split(" ")[1]
                except IndexError:
                    return error_response("Format token salah! Gunakan 'Bearer <token>'", 401)

            if not token:
                return error_response("Token tidak ditemukan! Anda harus login terlebih dahulu.", 401)

            try:
                # Dekripsi token menggunakan SECRET_KEY
                data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
                # Cari usernya di database berdasarkan id dari token
                current_user = User.query.get(data['user_id'])
                if not current_user:
                    return error_response("User pemilik token tidak terdaftar.", 401)
                    
            except jwt.ExpiredSignatureError:
                return error_response("Token sudah kedaluwarsa, silakan login ulang.", 401)
            except jwt.InvalidTokenError:
                return error_response("Token tidak valid / rusak.", 401)

            # PROTEKSI ROLE: Cek apakah role user diizinkan mengakses halaman ini
            if allowed_roles and current_user.role not in allowed_roles:
                return error_response("Akses ditolak! Role Anda tidak memiliki izin.", 403)

            # Jika lolos semua pemeriksaan, izinkan lanjut ke fungsi route utama
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator