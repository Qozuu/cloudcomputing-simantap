from app import db
from datetime import datetime

class TagihanFasilitas(db.Model):
    __tablename__ = 'tagihan_fasilitas'
    
    id = db.Column(db.Integer, primary_key=True)
    reservasi_id = db.Column(db.Integer, db.ForeignKey('reservasi_fasilitas.id'), nullable=False)
    total_tagihan = db.Column(db.Float, nullable=False)
    status_bayar = db.Column(db.String(32), default='Belum Lunas') # Belum Lunas, Lunas

    reservasi = db.relationship('Reservasi', backref='tagihan_reservasi')

    def to_dict(self):
        return {
            'id': self.id,
            'reservasi_id': self.reservasi_id,
            'total_tagihan': self.total_tagihan,
            'status_bayar': self.status_bayar
        }