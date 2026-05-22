from app import db
from datetime import datetime

class Staff(db.Model):
    __tablename__ = 'staffs'
    
    id = db.Column(db.Integer, primary_key=True)
    nama_staff = db.Column(db.String(64), nullable=False)
    posisi = db.Column(db.String(32), nullable=False) # Satpam, Cleaning Service, Teknisi
    nomer_hp = db.Column(db.String(16), nullable=True)
    status_kerja = db.Column(db.String(32), default='Aktif') # Aktif, Cuti

    def to_dict(self):
        return {
            'id': self.id,
            'nama_staff': self.nama_staff,
            'posisi': self.posisi,
            'nomer_hp': self.nomer_hp,
            'status_kerja': self.status_kerja
        }

class JadwalTugas(db.Model):
    __tablename__ = 'jadwal_tugas'
    
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staffs.id'), nullable=False)
    area = db.Column(db.String(64), nullable=False) # Lobby Tower A, Kolam Renang, Koridor lt.3
    hari_tugas = db.Column(db.String(16), nullable=False) # Senin, Selasa, dll
    shift = db.Column(db.String(16), nullable=False) # Pagi (07:00 - 15:00), Malam

    staff = db.relationship('Staff', backref='tugas_staff')

    def to_dict(self):
        return {
            'id': self.id,
            'nama_staff': self.staff.nama_staff if self.staff else None,
            'posisi_staff': self.staff.posisi if self.staff else None,
            'area': self.area,
            'hari_tugas': self.hari_tugas,
            'shift': self.shift
        }