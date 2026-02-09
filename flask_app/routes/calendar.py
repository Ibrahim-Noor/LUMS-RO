from flask import Blueprint, request, jsonify
from flask_app import db
from flask_app.models import CalendarEvent
from flask_app.decorators import jwt_required_with_user, role_required
from datetime import datetime

cal_bp = Blueprint('calendar', __name__)


@cal_bp.route('/calendar', methods=['GET'])
@jwt_required_with_user
def list_calendar_events(current_user=None):
    events = CalendarEvent.query.order_by(CalendarEvent.start_date.asc()).all()
    return jsonify([e.to_dict() for e in events]), 200


@cal_bp.route('/calendar', methods=['POST'])
@role_required('admin')
def create_calendar_event(current_user=None):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing request body'}), 400

    if not data.get('title') or not data.get('startDate') or not data.get('type'):
        return jsonify({'message': 'title, startDate, and type are required'}), 400

    event_type = data['type']
    if event_type not in ['holiday', 'exam', 'deadline', 'event']:
        return jsonify({'message': 'Invalid event type'}), 400

    try:
        start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return jsonify({'message': 'Invalid startDate format'}), 400

    end_date = None
    if data.get('endDate'):
        try:
            end_date = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return jsonify({'message': 'Invalid endDate format'}), 400

    event = CalendarEvent(
        title=data['title'],
        description=data.get('description'),
        start_date=start_date,
        end_date=end_date,
        type=event_type,
        created_by=current_user.id,
        created_at=datetime.utcnow(),
    )
    db.session.add(event)
    db.session.commit()

    return jsonify(event.to_dict()), 201
