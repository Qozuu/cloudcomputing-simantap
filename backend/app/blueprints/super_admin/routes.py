from flask import Blueprint
from sqlalchemy import func
from app import db
from app.models.tagihan import Tagihan
from app.middleware.auth import token_required
from app.utils.response_helper import success_response

super_admin_bp = Blueprint('super_admin', __name__)

@super_admin_bp.route('/dashboard-summary', methods=['GET'])
@token_required(allowed_roles=['super_admin']) # Diproteksi Satpam JWT
def dashboard_summary(current_user): # Menerima data user dari decorator satpam
    
    # Rumus Hitung Otomatis Keuangan
    total_pendapatan = db.session.query(func.sum(Tagihan.jumlah_tagihan)).filter(Tagihan.status == 'paid').scalar() or 0.0
    belum_dibayar = db.session.query(func.sum(Tagihan.jumlah_tagihan)).filter(Tagihan.status == 'unpaid').scalar() or 0.0
    total_tagihan = db.session.query(func.sum(Tagihan.jumlah_tagihan)).scalar() or 0.0

    summary_data = {
        "cards": {
            "total_pendapatan": total_pendapatan,   # Hasilnya Rp 124.500.000
            "belum_dibayar": belum_dibayar,         # Hasilnya Rp 25.500.000
            "total_tagihan": total_tagihan          # Hasilnya Rp 150.000.000
        }
    }
    
    return success_response(summary_data, "Data dashboard summary berhasil dimuat.")

@super_admin_bp.route('/revenue-chart', methods=['GET'])
@token_required(allowed_roles=['super_admin'])
def revenue_chart(current_user):
    # Data tren bulanan untuk disuplai ke Chart.js milik anak Frontend
    chart_data = [
        {"bulan": "Januari", "pendapatan": 45000000, "tagihan": 50000000},
        {"bulan": "Februari", "pendapatan": 39500000, "tagihan": 50000000},
        {"bulan": "Maret", "pendapatan": 40000000, "tagihan": 50000000}
    ]
    return success_response(chart_data, "Data tren chart bulanan berhasil dimuat.")