from flask import Blueprint, request
from app import db
from app.models.laporan import Laporan
from app.middleware.auth import token_required
from app.utils.response_helper import success_response, error_response

pemeliharaan_bp = Blueprint('pemeliharaan', __name__)

# 1. Fitur Penghuni: Kirim Laporan Kerusakan
@pemeliharaan_bp.route('/laporan', methods=['POST'])
@token_required(allowed_roles=['penghuni', 'super_admin'])
def kirim_laporan(current_user):
    data = request.get_json() or {}
    if not data.get('judul') or not data.get('deskripsi') or not data.get('unit_id'):
        return error_response("Judul, deskripsi, dan unit_id wajib diisi!", 400)
        
    laporan = Laporan(
        user_id=current_user.id,
        unit_id=data['unit_id'],
        judul=data['judul'],
        deskripsi=data['deskripsi']
    )
    db.session.add(laporan)
    db.session.commit()
    return success_response(laporan.to_dict(), "Laporan kerusakan berhasil dikirim!", 201)

# 2. Fitur Admin: Lihat Semua Laporan Masuk
@pemeliharaan_bp.route('/laporan', methods=['GET'])
@token_required(allowed_roles=['super_admin'])
def lihat_semua_laporan(current_user):
    laporans = Laporan.query.all()
    return success_response([l.to_dict() for l in laporans], "Semua laporan berhasil dimuat.")

# 3. Fitur Admin: Ubah Status (Pending -> On Progress -> Resolved)
@pemeliharaan_bp.route('/laporan/<int:id>/status', methods=['PUT'])
@token_required(allowed_roles=['super_admin'])
def update_status_laporan(current_user, id):
    data = request.get_json() or {}
    status_baru = data.get('status')
    
    if status_baru not in ['Pending', 'On Progress', 'Resolved']:
        return error_response("Status tidak valid!", 400)
        
    laporan = Laporan.query.get(id)
    if not laporan:
        return error_response("Laporan tidak ditemukan!", 404)
        
    laporan.status = status_baru
    db.session.commit()
    return success_response(laporan.to_dict(), f"Status laporan berhasil diubah menjadi {status_baru}!")