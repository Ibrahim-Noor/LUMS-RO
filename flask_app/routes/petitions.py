from flask import Blueprint, request, jsonify
from flask_app import db
from flask_app.models import GradeChangePetition
from flask_app.decorators import jwt_required_with_user, role_required
from datetime import datetime

pet_bp = Blueprint('petitions', __name__)


@pet_bp.route('/petitions', methods=['GET'])
@jwt_required_with_user
def list_petitions(current_user=None):
    if current_user.role == 'admin':
        petitions = GradeChangePetition.query.order_by(GradeChangePetition.created_at.desc()).all()
    elif current_user.role == 'instructor':
        petitions = GradeChangePetition.query.filter_by(instructor_id=current_user.id).order_by(GradeChangePetition.created_at.desc()).all()
    else:
        petitions = []

    return jsonify([p.to_dict() for p in petitions]), 200


@pet_bp.route('/petitions', methods=['POST'])
@role_required('instructor')
def create_petition(current_user=None):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing request body'}), 400

    required_fields = ['studentId', 'courseCode', 'currentGrade', 'newGrade', 'justification']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    pending_statuses = ['submitted', 'pending_approval']
    existing_pending = GradeChangePetition.query.filter(
        GradeChangePetition.instructor_id == current_user.id,
        GradeChangePetition.status.in_(pending_statuses)
    ).first()
    if existing_pending:
        return jsonify({'message': 'You already have a pending grade change petition. Please wait until it is approved or rejected before submitting a new one.'}), 400

    petition = GradeChangePetition(
        instructor_id=current_user.id,
        student_id=data['studentId'],
        course_code=data['courseCode'],
        current_grade=data['currentGrade'],
        new_grade=data['newGrade'],
        justification=data['justification'],
        status='submitted',
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.session.add(petition)
    db.session.commit()

    return jsonify(petition.to_dict()), 201


@pet_bp.route('/petitions/<int:pet_id>/status', methods=['PATCH'])
@role_required('admin')
def update_petition_status(pet_id, current_user=None):
    petition = GradeChangePetition.query.get(pet_id)
    if not petition:
        return jsonify({'message': 'Petition not found'}), 404

    data = request.get_json()
    status = data.get('status')
    if status not in ['pending_approval', 'approved', 'rejected']:
        return jsonify({'message': 'Invalid status'}), 400

    petition.status = status
    petition.admin_comment = data.get('adminComment', petition.admin_comment)
    petition.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(petition.to_dict()), 200
