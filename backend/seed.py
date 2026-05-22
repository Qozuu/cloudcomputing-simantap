from app import create_app, db
from app.models.user import User
from app.models.unit import Unit
from app.models.tagihan import Tagihan

app = create_app()

with app.app_context():
    print("Mengosongkan database lama...")
    db.drop_all()
    db.create_all()
    
    print("Membuat akun pengguna baru...")
    admin = User(username="oliveadmin", email="olive@simantap.com", role="super_admin")
    admin.set_password("rahasia123") # Password login kamu nanti
    db.session.add(admin)
    
    print("Membuat data unit apartemen...")
    unit1 = Unit(nomer_unit="A-101", tower="Anggrek", tipe_unit="2BR", nama_pemilik="Khairunisa Olive")
    unit2 = Unit(nomer_unit="B-205", tower="Bonsai", tipe_unit="Studio", nama_pemilik="Budi Setiadi")
    db.session.add(unit1)
    db.session.add(unit2)
    db.session.flush() # Ambil ID unit secara instan untuk relasi Foreign Key
    
    print("Menyuntikkan data keuangan Rp 124.500.000...")
    t1 = Tagihan(unit_id=unit1.id, bulan="Mei 2026", jumlah_tagihan=64500000.0, status="paid")
    t2 = Tagihan(unit_id=unit2.id, bulan="Mei 2026", jumlah_tagihan=60000000.0, status="paid")
    t3 = Tagihan(unit_id=unit1.id, bulan="Mei 2026", jumlah_tagihan=25500000.0, status="unpaid")
    db.session.add_all([t1, t2, t3])
    
    db.session.commit()
    print("🟢 SEEDING DATA BERHASIL! Database SiManTap siap digunakan.")