from app import db
from datetime import datetime

class Visitor(db.Model):
    __tablename__ = 'visitors'
    
    id = db.Column(db.Integer, primary_key=True)
    nama_tamu = db.Column(db.String(64), nullable=False)
    nomer_identitas = db.Column(db.String(32), nullable=True) # KTP / SIM
    unit_tujuan = db.Column(db.String(16), nullable=False) # Misal: "A-101"
    keperluan = db.Column(db.String(128), nullable=False) # Misal: "Kirim Paket / Antar Barang"
    waktu_masuk = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nama_tamu': self.nama_tamu,
            'unit_tujuan': self.unit_tujuan,
            'keperluan': self.keperluan,
            'waktu_masuk': self.waktu_masuk.isoformat() if self.waktu_masuk else None
        }