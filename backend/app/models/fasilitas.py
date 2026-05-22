from app import db
from datetime import datetime

class Fasilitas(db.Model):
    __tablename__ = 'fasilitas'
    
    id = db.Column(db.Integer, primary_key=True)
    nama_fasilitas = db.Column(db.String(64), nullable=False) # Lapangan Tenis, Aula, Gym
    kapasitas = db.Column(db.Integer, default=20)
    status_fasilitas = db.Column(db.String(32), default='Tersedia') # Tersedia, Pemeliharaan

    def to_dict(self):
        return {
            'id': self.id,
            'nama_fasilitas': self.nama_fasilitas,
            'kapasitas': self.kapasitas,
            'status_fasilitas': self.status_fasilitas
        }

class Reservasi(db.Model):
    __tablename__ = 'reservasis'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    fasilitas_id = db.Column(db.Integer, db.ForeignKey('fasilitas.id'), nullable=False)
    tanggal_booking = db.Column(db.String(32), nullable=False) # Format: YYYY-MM-DD
    jam = db.Column(db.String(16), nullable=False) # Misal: "10:00 - 12:00"
    status_booking = db.Column(db.String(32), default='Disetujui') # Disetujui, Dibatalkan

    user = db.relationship('User', backref='user_reservasi')
    fasilitas = db.relationship('Fasilitas', backref='fasilitas_booked')

    def to_dict(self):
        return {
            'id': self.id,
            'nama_penghuni': self.user.username if self.user else None,
            'nama_fasilitas': self.fasilitas.nama_fasilitas if self.fasilitas else None,
            'tanggal_booking': self.tanggal_booking,
            'jam': self.jam,
            'status_booking': self.status_booking
        }