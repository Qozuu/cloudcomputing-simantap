import jwt
import datetime
from flask import Blueprint, request, current_app
from app.models.user import User
from app.utils.response_helper import success_response, error_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    
    # Validasi input kosong
    if 'username' not in data or 'password' not in data:
        return error_response("Username dan password wajib diisi!", 400)
        
    # Cari user berdasarkan username
    user = User.query.filter_by(username=data['username']).first()
    
    # Cek kecocokan user dan password hash
    if user is None or not user.check_password(data['password']):
        return error_response("Username atau password salah!", 401)
        
    # Jika sukses, generate token JWT
    payload = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1) # Token expired dalam 1 hari
    }
    
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    
    data_response = {
        "token": token,
        "user": user.to_dict()
    }
    
    return success_response(data_response, "Login berhasil! Selamat datang di SiManTap.")