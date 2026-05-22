from flask import Blueprint, request
from app import db
from app.models.visitor import Visitor
from app.middleware.auth import token_required
from app.utils.response_helper import success_response, error_response

keamanan_bp = Blueprint('keamanan', __name__)

@keamanan_bp.route('/visitors', methods=['POST'])
@token_required(allowed_roles=['super_admin'])
def catat_tamu(current_user):
    data = request.get_json() or {}
    if not data.get('nama_tamu') or not data.get('unit_tujuan') or not data.get('keperluan'):
        return error_response("Data tamu tidak lengkap!", 400)
        
    visitor = Visitor(
        nama_tamu=data['nama_tamu'],
        nomer_identitas=data.get('nomer_identitas'),
        unit_tujuan=data['unit_tujuan'],
        keperluan=data['keperluan']
    )
    db.session.add(visitor)
    db.session.commit()
    return success_response(visitor.to_dict(), "Data tamu berhasil dicatat!", 201)

@keamanan_bp.route('/visitors', methods=['GET'])
@token_required(allowed_roles=['super_admin'])
def lihat_tamu(current_user):
    visitors = Visitor.query.all()
    return success_response([v.to_dict() for v in visitors], "Log data tamu berhasil dimuat.")