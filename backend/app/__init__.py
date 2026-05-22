from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    from app.blueprints.auth.routes import auth_bp
    from app.blueprints.super_admin.routes import super_admin_bp
    from app.blueprints.keuangan.routes import keuangan_bp
    from app.blueprints.pemeliharaan.routes import pemeliharaan_bp
    from app.blueprints.fasilitas.routes import fasilitas_bp
    from app.blueprints.keamanan.routes import keamanan_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(super_admin_bp, url_prefix='/api/super_admin')
    app.register_blueprint(keuangan_bp, url_prefix='/api/keuangan')
    app.register_blueprint(pemeliharaan_bp, url_prefix='/api/pemeliharaan')
    app.register_blueprint(fasilitas_bp, url_prefix='/api/fasilitas')
    app.register_blueprint(keamanan_bp, url_prefix='/api/keamanan')

    with app.app_context():
        from app import models

    return app