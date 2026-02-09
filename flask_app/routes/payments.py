from flask import Blueprint, request, jsonify
from flask_app import db
from flask_app.models import Payment, DocumentRequest
from flask_app.decorators import jwt_required_with_user
from datetime import datetime
import uuid

pay_bp = Blueprint('payments', __name__)


@pay_bp.route('/payments', methods=['POST'])
@jwt_required_with_user
def process_payment(current_user=None):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing request body'}), 400

    request_id = data.get('requestId')
    amount = data.get('amount')
    method = data.get('method')

    if not request_id or not amount:
        return jsonify({'message': 'requestId and amount are required'}), 400

    if method not in ['online', 'voucher']:
        return jsonify({'message': 'Invalid payment method'}), 400

    doc_req = DocumentRequest.query.get(request_id)
    if not doc_req:
        return jsonify({'message': 'Document request not found'}), 404

    payment = Payment(
        request_id=request_id,
        amount=amount,
        status='paid',
        transaction_id=str(uuid.uuid4())[:8].upper(),
        method=method,
        created_at=datetime.utcnow(),
    )
    db.session.add(payment)

    doc_req.status = 'pending_approval'
    doc_req.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(payment.to_dict()), 200
