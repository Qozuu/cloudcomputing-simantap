from flask import Blueprint, request
from app import db
from app.models.fasilitas import Fasilitas, Reservasi
from app.middleware.auth import token_required
from app.utils.response_helper import success_response, error_response

fasilitas_bp = Blueprint('fasilitas', __name__)

@fasilitas_bp.route('/daftar', methods=['GET'])
@token_required()
def get_fasilitas(current_user):
    all_fasilitas = Fasilitas.query.all()
    return success_response([f.to_dict() for f in all_fasilitas], "Daftar fasilitas berhasil dimuat.")

@fasilitas_bp.route('/booking', methods=['POST'])
@token_required(allowed_roles=['penghuni', 'super_admin'])
def booking_fasilitas(current_user):
    data = request.get_json() or {}
    if not data.get('fasilitas_id') or not data.get('tanggal_booking') or not data.get('jam'):
        return error_response("Data booking tidak lengkap!", 400)
        
    new_booking = Reservasi(
        user_id=current_user.id,
        fasilitas_id=data['fasilitas_id'],
        tanggal_booking=data['tanggal_booking'],
        jam=data['jam']
    )
    db.session.add(new_booking)
    db.session.commit()
    return success_response(new_booking.to_dict(), "Fasilitas berhasil dipesan!", 201)