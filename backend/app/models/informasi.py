from app import db
from datetime import datetime

class Informasi(db.Model):
    __tablename__ = 'informasi'
    
    id = db.Column(db.Integer, primary_key=True)
    judul = db.Column(db.String(128), nullable=False)
    konten = db.Column(db.Text, nullable=False)
    tanggal_publikasi = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'judul': self.judul,
            'konten': self.konten,
            'tanggal_publikasi': self.tanggal_publikasi.isoformat()
        }