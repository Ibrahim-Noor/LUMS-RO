from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask_app.models import User


def jwt_required_with_user(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        if not user.is_active:
            return jsonify({'message': 'Account is deactivated'}), 403
        kwargs['current_user'] = user
        return fn(*args, **kwargs)
    return wrapper


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user:
                return jsonify({'message': 'User not found'}), 404
            if not user.is_active:
                return jsonify({'message': 'Account is deactivated'}), 403
            if user.role not in roles:
                return jsonify({'message': 'Insufficient permissions'}), 403
            kwargs['current_user'] = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator
