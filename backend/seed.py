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

    print("Menyuntikkan data fasilitas dummy...")
    from app.models.fasilitas import Fasilitas
    f1 = Fasilitas(nama_fasilitas="Kolam Renang Tower A", kapasitas=15, status_fasilitas="Tersedia")
    f2 = Fasilitas(nama_fasilitas="Lapangan Tenis lt. 5", kapasitas=4, status_fasilitas="Tersedia")
    db.session.add_all([f1, f2])
    
    print("Menyuntikkan data staff dan jadwal tugas...")
    from app.models.jadwal import Staff, JadwalTugas
    st1 = Staff(nama_staff="Pak Bambang", posisi="Satpam", nomer_hp="08123456789")
    st2 = Staff(nama_staff="Mbak Sri", posisi="Cleaning Service", nomer_hp="08987654321")
    db.session.add_all([st1, st2])
    db.session.flush() # Ambil ID secara real-time sebelum commit
    
    j1 = JadwalTugas(staff_id=st1.id, area="Pintu Gerbang Utama", hari_tugas="Senin", shift="Malam (15:00 - 23:00)")
    j2 = JadwalTugas(staff_id=st2.id, area="Kolam Renang Tower A", hari_tugas="Selasa", shift="Pagi (07:00 - 15:00)")
    db.session.add_all([j1, j2])
    
    db.session.commit()
    print("🟢 SEEDING DATA PARIPURNA BERHASIL!")
    
    db.session.commit()
    print("🟢 SEEDING DATA BERHASIL! Database SiManTap siap digunakan.")