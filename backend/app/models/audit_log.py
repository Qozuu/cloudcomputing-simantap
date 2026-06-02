from datetime import datetime
from app import db  # Langsung panggil db dari root app
from sqlalchemy.dialects.postgresql import UUID
import uuid

class AuditLogs(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    action = db.Column(db.String, nullable=False)
    module = db.Column(db.String)
    description = db.Column(db.Text)
    action_type = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)