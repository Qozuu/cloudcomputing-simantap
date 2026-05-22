from flask import jsonify

def success_response(data=None, message="Operasi berhasil", status_code=200):
    response = {
        "status": "success",
        "message": message
    }
    if data is not None:
        response["data"] = data
    return jsonify(response), status_code

def error_response(message="Terjadi kesalahan pada server", status_code=500):
    return jsonify({
        "status": "error",
        "message": message
    }), status_code