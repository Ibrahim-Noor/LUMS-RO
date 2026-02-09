from flask import Blueprint, request, jsonify
from flask_app import db
from flask_app.models import DocumentRequest, Payment
from flask_app.decorators import jwt_required_with_user, role_required
from datetime import datetime

doc_bp = Blueprint('document_requests', __name__)


@doc_bp.route('/document-requests', methods=['GET'])
@jwt_required_with_user
def list_document_requests(current_user=None):
    if current_user.role == 'admin':
        requests = DocumentRequest.query.order_by(DocumentRequest.created_at.desc()).all()
    else:
        requests = DocumentRequest.query.filter_by(user_id=current_user.id).order_by(DocumentRequest.created_at.desc()).all()

    result = []
    for req in requests:
        req_dict = req.to_dict()
        payment = Payment.query.filter_by(request_id=req.id).first()
        if payment:
            req_dict['payment'] = payment.to_dict()
        result.append(req_dict)

    return jsonify(result), 200


@doc_bp.route('/document-requests', methods=['POST'])
@role_required('student')
def create_document_request(current_user=None):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing request body'}), 400

    doc_type = data.get('type')
    if doc_type not in ['transcript', 'degree', 'letter', 'duplicate_degree']:
        return jsonify({'message': 'Invalid document type'}), 400

    urgency = data.get('urgency', 'normal')
    if urgency not in ['normal', 'urgent']:
        return jsonify({'message': 'Invalid urgency'}), 400

    pending_statuses = ['submitted', 'payment_pending', 'pending_approval']
    existing_pending = DocumentRequest.query.filter(
        DocumentRequest.user_id == current_user.id,
        DocumentRequest.status.in_(pending_statuses)
    ).first()
    if existing_pending:
        return jsonify({'message': 'You already have a pending document request. Please wait until it is approved or rejected before submitting a new one.'}), 400

    copies = data.get('copies', 1)
    amount = data.get('amount')
    details = data.get('details')

    new_request = DocumentRequest(
        user_id=current_user.id,
        type=doc_type,
        urgency=urgency,
        status='payment_pending',
        copies=copies,
        amount=amount,
        details=details,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.session.add(new_request)
    db.session.commit()

    return jsonify(new_request.to_dict()), 201


@doc_bp.route('/document-requests/<int:req_id>/status', methods=['PATCH'])
@role_required('admin')
def update_document_request_status(req_id, current_user=None):
    doc_req = DocumentRequest.query.get(req_id)
    if not doc_req:
        return jsonify({'message': 'Request not found'}), 404

    data = request.get_json()
    status = data.get('status')
    valid_statuses = ['submitted', 'payment_pending', 'pending_approval', 'approved', 'completed', 'rejected']
    if status not in valid_statuses:
        return jsonify({'message': 'Invalid status'}), 400

    doc_req.status = status
    doc_req.admin_comment = data.get('adminComment', doc_req.admin_comment)
    doc_req.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(doc_req.to_dict()), 200
