from flask import Blueprint, request
from app import db
from app.models.incident import Incident
from app.middleware.auth import token_required
from app.utils.response_helper import success_response, error_response

pemeliharaan_bp = Blueprint('pemeliharaan_fitur', __name__)

@pemeliharaan_bp.route('/laporan', methods=['GET'])
@token_required()
def get_all_incidents(current_user):
    # Kalau dia penghuni, cuma bisa lihat laporan dia sendiri. Kalau admin bisa lihat semua.
    if current_user.role == 'penghuni':
        incidents = Incident.query.filter_by(user_id=current_user.id).all()
    else:
        incidents = Incident.query.all()
        
    return success_response([i.to_dict() for i in incidents], "Daftar laporan insiden berhasil dimuat.")

@pemeliharaan_bp.route('/laporan', methods=['POST'])
@token_required(allowed_roles=['penghuni', 'super_admin'])
def buat_laporan_insiden(current_user):
    data = request.get_json() or {}
    if not data.get('judul_laporan') or not data.get('deskripsi') or not data.get('lokasi'):
        return error_response("Judul, deskripsi, dan lokasi insiden wajib diisi!", 400)
        
    new_incident = Incident(
        user_id=current_user.id,
        judul_laporan=data['judul_laporan'],
        deskripsi=data['deskripsi'],
        lokasi=data['lokasi'],
        tingkat_darurat=data.get('tingkat_darurat', 'Sedang')
    )
    db.session.add(new_incident)
    db.session.commit()
    return success_response(new_incident.to_dict(), "Laporan insiden berhasil dikirim ke sistem!", 201)

@pemeliharaan_bp.route('/laporan/<int:incident_id>/status', methods=['PUT'])
@token_required(allowed_roles=['super_admin'])
def update_status_insiden(current_user, incident_id):
    data = request.get_json() or {}
    status_baru = data.get('status_laporan')
    
    if not status_baru:
        return error_response("Status laporan baru wajib dicantumkan!", 400)
        
    incident = Incident.query.get(incident_id)
    if not incident:
        return error_response("Laporan insiden tidak ditemukan!", 404)
        
    incident.status_laporan = status_baru
    db.session.commit()
    return success_response(incident.to_dict(), f"Status laporan berhasil diubah menjadi: {status_baru}")