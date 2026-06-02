from app import db
from datetime import datetime

class Reservasi(db.Model):
    __tablename__ = 'reservasi_fasilitas'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    fasilitas_id = db.Column(db.Integer, db.ForeignKey('fasilitas.id'), nullable=False)
    waktu_booking = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(32), default='Disetujui') # Disetujui, Dibatalkan

    user = db.relationship('User', backref='user_reservasi')
    fasilitas = db.relationship('Fasilitas', backref='fasilitas_reservasi')

    def to_dict(self):
        return {
            'id': self.id,
            'nama_penghuni': self.user.username if self.user else None,
            'nama_fasilitas': self.fasilitas.nama_fasilitas if self.fasilitas else None,
            'waktu_booking': self.waktu_booking.isoformat(),
            'status': self.status
        }