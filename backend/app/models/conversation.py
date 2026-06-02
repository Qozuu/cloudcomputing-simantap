from datetime import datetime
from app import db  # Langsung panggil db dari root app
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Conversations(db.Model):
    __tablename__ = 'conversations'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ConversationParticipants(db.Model):
    __tablename__ = 'conversation_participants'
    
    conversation_id = db.Column(UUID(as_uuid=True), db.ForeignKey('conversations.id'), primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Messages(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = db.Column(UUID(as_uuid=True), db.ForeignKey('conversations.id'), nullable=False)
    sender_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)