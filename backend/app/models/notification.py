from datetime import datetime
from app import db  # Langsung panggil db dari root app
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Notifications(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String, nullable=False)
    message = db.Column(db.Text, nullable=False)
    category = db.Column(db.String)
    priority = db.Column(db.String)
    target_tower = db.Column(db.String)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)