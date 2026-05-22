from flask import Blueprint, request
from app import db
from app.models.jadwal import JadwalTugas
from app.middleware.auth import token_required
from app.utils.response_helper import success_response, error_response

kebersihan_bp = Blueprint('kebersihan', __name__)

@kebersihan_bp.route('/jadwal', methods=['GET'])
@token_required()
def get_jadwal_tugas(current_user):
    jadwal = JadwalTugas.query.all()
    return success_response([j.to_dict() for j in jadwal], "Jadwal tugas staff berhasil dimuat.")