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

    pending_statuses = ['submitted', 'pending_approval']
    existing_pending = MajorApplication.query.filter(
        MajorApplication.student_id == current_user.id,
        MajorApplication.status.in_(pending_statuses)
    ).first()
    if existing_pending:
        return jsonify({'message': 'You already have a pending major declaration. Please wait until it is approved or rejected before submitting a new one.'}), 400

    latest_approved = MajorApplication.query.filter(
        MajorApplication.student_id == current_user.id,
        MajorApplication.status == 'approved'
    ).order_by(MajorApplication.created_at.desc()).first()

    current_school = None
    current_major_name = "Undeclared"
    if latest_approved:
        current_school = latest_approved.school
        current_major_name = latest_approved.requested_major

    requested_school = data['school']
    requested_major = data['requestedMajor']
    if current_school and current_school == requested_school and current_major_name == requested_major:
        return jsonify({'message': f'You are already declared as {requested_major} in {requested_school}. Please choose a different major or school.'}), 400

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
