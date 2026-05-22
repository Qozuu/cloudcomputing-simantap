from app import db
from datetime import datetime

class Tagihan(db.Model):
    __tablename__ = 'tagihans'
    
    id = db.Column(db.Integer, primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    bulan = db.Column(db.String(32), nullable=False) # Contoh: "Januari 2026", "Februari 2026"
    jumlah_tagihan = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(16), nullable=False, default='unpaid') # paid, unpaid
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'unit_id': self.unit_id,
            'nomer_unit': self.unit.nomer_unit if self.unit else None,
            'bulan': self.bulan,
            'jumlah_tagihan': self.jumlah_tagihan,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }