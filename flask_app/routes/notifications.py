from flask import Blueprint, jsonify
from flask_app.models import Notification
from flask_app.decorators import jwt_required_with_user

notif_bp = Blueprint('notifications', __name__)


@notif_bp.route('/notifications', methods=['GET'])
@jwt_required_with_user
def list_notifications(current_user=None):
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200
