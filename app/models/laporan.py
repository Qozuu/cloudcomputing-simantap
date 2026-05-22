from app import db
from datetime import datetime

class Laporan(db.Model):
    __tablename__ = 'laporans'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Siapa yang lapor
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False) # Kamar mana yang rusak
    judul = db.Column(db.String(128), nullable=False) # Misal: "Pipa Bocor"
    deskripsi = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(32), nullable=False, default='Pending') # Pending, On Progress, Resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relasi untuk mempermudah mengambil data nama pelapor & nomor unit
    pelapor = db.relationship('User', backref='laporan_user')
    unit_terkait = db.relationship('Unit', backref='laporan_unit')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'nama_pelapor': self.pelapor.username if self.pelapor else None,
            'nomer_unit': self.unit_terkait.nomer_unit if self.unit_terkait else None,
            'judul': self.judul,
            'deskripsi': self.deskripsi,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }