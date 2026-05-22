from flask import Blueprint, request
from app import db
from app.models.unit import Unit
from app.middleware.auth import token_required
from app.utils.response_helper import success_response, error_response

keuangan_bp = Blueprint('keuangan', __name__)

# 1. Meliat Semua Daftar Kamar/Unit
@keuangan_bp.route('/units', methods=['GET'])
@token_required(allowed_roles=['super_admin', 'admin_keuangan'])
def get_all_units(current_user):
    units = Unit.query.all()
    return success_response([u.to_dict() for u in units], "Daftar unit berhasil dimuat.")

# 2. Tambah Kamar Baru
@keuangan_bp.route('/units', methods=['POST'])
@token_required(allowed_roles=['super_admin'])
def create_unit(current_user):
    data = request.get_json() or {}
    if not data.get('nomer_unit') or not data.get('tower') or not data.get('nama_pemilik'):
        return error_response("Data unit tidak lengkap!", 400)
        
    new_unit = Unit(
        nomer_unit=data['nomer_unit'],
        tower=data['tower'],
        tipe_unit=data.get('tipe_unit', 'Studio'),
        nama_pemilik=data['nama_pemilik']
    )
    db.session.add(new_unit)
    db.session.commit()
    return success_response(new_unit.to_dict(), "Unit baru berhasil ditambahkan!", 201)