from app import db

class Unit(db.Model):
    __tablename__ = 'units'
    
    id = db.Column(db.Integer, primary_key=True)
    nomer_unit = db.Column(db.String(16), unique=True, nullable=False)
    tower = db.Column(db.String(16), nullable=False)
    tipe_unit = db.Column(db.String(32), nullable=False) # Studio, 2BR, 3BR
    nama_pemilik = db.Column(db.String(128), nullable=False)
    
    # Relasi balik untuk mempermudah penarikan data tagihan dari unit ini
    tagihans = db.relationship('Tagihan', backref='unit', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'nomer_unit': self.nomer_unit,
            'tower': self.tower,
            'tipe_unit': self.tipe_unit,
            'nama_pemilik': self.nama_pemilik
        }