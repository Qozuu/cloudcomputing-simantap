from app import db
from datetime import datetime

class Incident(db.Model):
    __tablename__ = 'incidents'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Siapa penghuni yang lapor
    judul_laporan = db.Column(db.String(128), nullable=False) # Misal: "Pipa Bocor Koridor"
    deskripsi = db.Column(db.Text, nullable=False)
    lokasi = db.Column(db.String(64), nullable=False) # Misal: "Lantai 3 Tower B"
    tingkat_darurat = db.Column(db.String(16), default='Sedang') # Rendah, Sedang, Tinggi (Urgent)
    status_laporan = db.Column(db.String(32), default='Menunggu Tindakan') # Menunggu Tindakan, Diproses, Selesai
    waktu_lapor = db.Column(db.DateTime, default=datetime.utcnow)

    # Relasi ke user agar bisa tahu nama pelapornya
    user = db.relationship('User', backref='user_incidents')

    def to_dict(self):
        return {
            'id': self.id,
            'nama_pelapor': self.user.username if self.user else None,
            'judul_laporan': self.judul_laporan,
            'deskripsi': self.deskripsi,
            'lokasi': self.lokasi,
            'tingkat_darurat': self.tingkat_darurat,
            'status_laporan': self.status_laporan,
            'waktu_lapor': self.waktu_lapor.isoformat() if self.waktu_lapor else None
        }