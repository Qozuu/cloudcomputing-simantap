from flask import Blueprint, request
from app import db
from app.models.jadwal import Staff
from app.middleware.auth import token_required
from app.utils.response_helper import success_response, error_response

sdm_bp = Blueprint('sdm', __name__)

@sdm_bp.route('/karyawan', methods=['GET'])
@token_required(allowed_roles=['super_admin'])
def get_all_staff(current_user):
    karyawan = Staff.query.all()
    return success_response([k.to_dict() for k in karyawan], "Data karyawan berhasil dimuat.")

@sdm_bp.route('/karyawan', methods=['POST'])
@token_required(allowed_roles=['super_admin'])
def tambah_karyawan(current_user):
    data = request.get_json() or {}
    if not data.get('nama_staff') or not data.get('posisi'):
        return error_response("Nama staff dan posisi wajib diisi!", 400)
        
    karyawan_baru = Staff(
        nama_staff=data['nama_staff'],
        posisi=data['posisi'],
        nomer_hp=data.get('nomer_hp')
    )
    db.session.add(karyawan_baru)
    db.session.commit()
    return success_response(karyawan_baru.to_dict(), "Karyawan baru berhasil ditambahkan!", 201)