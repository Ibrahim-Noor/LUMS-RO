from flask_app import db
from datetime import datetime
import uuid


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()), server_default=db.text("gen_random_uuid()"))
    email = db.Column(db.String, unique=True, nullable=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    first_name = db.Column(db.String, nullable=True)
    last_name = db.Column(db.String, nullable=True)
    full_name = db.Column(db.Text, nullable=True)
    role = db.Column(db.Text, nullable=False, server_default='student')
    is_active = db.Column(db.Boolean, nullable=False, server_default=db.text('true'))
    student_id = db.Column(db.Text, nullable=True)
    department = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'fullName': self.full_name,
            'role': self.role,
            'isActive': self.is_active,
            'studentId': self.student_id,
            'department': self.department,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class DocumentRequest(db.Model):
    __tablename__ = 'document_requests'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String, nullable=False)
    type = db.Column(db.Text, nullable=False)
    urgency = db.Column(db.Text, nullable=False, server_default='normal')
    status = db.Column(db.Text, nullable=False, server_default='payment_pending')
    copies = db.Column(db.Integer, nullable=False, server_default=db.text('1'))
    amount = db.Column(db.Integer, nullable=True)
    details = db.Column(db.JSON, nullable=True)
    admin_comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'type': self.type,
            'urgency': self.urgency,
            'status': self.status,
            'copies': self.copies,
            'amount': self.amount,
            'details': self.details,
            'adminComment': self.admin_comment,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    request_id = db.Column(db.Integer, nullable=True)
    amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Text, nullable=False, server_default='pending')
    transaction_id = db.Column(db.Text, nullable=True)
    method = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'requestId': self.request_id,
            'amount': self.amount,
            'status': self.status,
            'transactionId': self.transaction_id,
            'method': self.method,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class GradeChangePetition(db.Model):
    __tablename__ = 'grade_change_petitions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    instructor_id = db.Column(db.String, nullable=False)
    student_id = db.Column(db.Text, nullable=False)
    course_code = db.Column(db.Text, nullable=False)
    current_grade = db.Column(db.Text, nullable=False)
    new_grade = db.Column(db.Text, nullable=False)
    justification = db.Column(db.Text, nullable=False)
    status = db.Column(db.Text, nullable=False, server_default='submitted')
    admin_comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'instructorId': self.instructor_id,
            'studentId': self.student_id,
            'courseCode': self.course_code,
            'currentGrade': self.current_grade,
            'newGrade': self.new_grade,
            'justification': self.justification,
            'status': self.status,
            'adminComment': self.admin_comment,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class MajorApplication(db.Model):
    __tablename__ = 'major_applications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String, nullable=False)
    current_major = db.Column(db.Text, nullable=True)
    requested_major = db.Column(db.Text, nullable=False)
    school = db.Column(db.Text, nullable=False)
    statement = db.Column(db.Text, nullable=True)
    status = db.Column(db.Text, nullable=False, server_default='submitted')
    admin_comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'currentMajor': self.current_major,
            'requestedMajor': self.requested_major,
            'school': self.school,
            'statement': self.statement,
            'status': self.status,
            'adminComment': self.admin_comment,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class CalendarEvent(db.Model):
    __tablename__ = 'calendar_events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=True)
    type = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'type': self.type,
            'createdBy': self.created_by,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String, nullable=False)
    title = db.Column(db.Text, nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.Text, nullable=True)
    is_read = db.Column(db.Boolean, nullable=False, server_default=db.text('false'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'isRead': self.is_read,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
