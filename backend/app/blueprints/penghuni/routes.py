from flask import Blueprint
from app.models.informasi import Informasi
from app.middleware.auth import token_required
from app.utils.response_helper import success_response

penghuni_bp = Blueprint('penghuni', __name__)

@penghuni_bp.route('/pengumuman', methods=['GET'])
@token_required()
def get_pengumuman(current_user):
    pengumuman = Informasi.query.order_by(Informasi.tanggal_publikasi.desc()).all()
    return success_response([p.to_dict() for p in pengumuman], "Papan pengumuman berhasil dimuat.")