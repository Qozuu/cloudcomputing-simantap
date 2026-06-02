from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(32), nullable=False, default='penghuni')  # super_admin, admin_keuangan, penghuni
    status = db.Column(db.String(16), nullable=False, default='aktif')  # pending, aktif
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Mengubah password polos menjadi hash acak sebelum disimpan"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Mengecek apakah password yang diinput cocok dengan hash di database"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Mengubah objek database menjadi dictionary/JSON untuk Frontend"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }