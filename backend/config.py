import os
from dotenv import load_dotenv

base_dir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(base_dir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-fallback-key-12345')
    # Menggunakan SQLite lokal (simantap_dev.db) untuk pengerjaan di laptop
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(base_dir, 'simantap_dev.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False