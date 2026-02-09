from flask import Blueprint, request, jsonify
from flask_app import db
from flask_app.models import MajorApplication
from flask_app.decorators import jwt_required_with_user, role_required
from datetime import datetime

major_bp = Blueprint('major_applications', __name__)


@major_bp.route('/major-applications', methods=['GET'])
@jwt_required_with_user
def list_major_applications(current_user=None):
    if current_user.role == 'admin':
        applications = MajorApplication.query.order_by(MajorApplication.created_at.desc()).all()
    else:
        applications = MajorApplication.query.filter_by(student_id=current_user.id).order_by(MajorApplication.created_at.desc()).all()

    return jsonify([a.to_dict() for a in applications]), 200


@major_bp.route('/major-applications', methods=['POST'])
@role_required('student')
def create_major_application(current_user=None):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing request body'}), 400

    if not data.get('requestedMajor') or not data.get('school'):
        return jsonify({'message': 'requestedMajor and school are required'}), 400

    application = MajorApplication(
        student_id=current_user.id,
        current_major=data.get('currentMajor'),
        requested_major=data['requestedMajor'],
        school=data['school'],
        statement=data.get('statement'),
        status='submitted',
        created_at=datetime.utcnow(),
    )
    db.session.add(application)
    db.session.commit()

    return jsonify(application.to_dict()), 201


@major_bp.route('/major-applications/<int:app_id>/status', methods=['PATCH'])
@role_required('admin')
def update_major_application_status(app_id, current_user=None):
    application = MajorApplication.query.get(app_id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404

    data = request.get_json()
    status = data.get('status')
    if status not in ['pending_approval', 'approved', 'rejected']:
        return jsonify({'message': 'Invalid status'}), 400

    application.status = status
    application.admin_comment = data.get('adminComment', application.admin_comment)
    db.session.commit()

    return jsonify(application.to_dict()), 200
