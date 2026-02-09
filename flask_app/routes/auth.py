from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, verify_jwt_in_request, jwt_required
from flask_app import db, bcrypt
from flask_app.models import User
from flask_app.decorators import jwt_required_with_user

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing request body'}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401

    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'message': 'Account is deactivated'}), 403

    access_token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/user', methods=['GET'])
@jwt_required_with_user
def get_current_user(current_user=None):
    return jsonify(current_user.to_dict()), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_active:
        return jsonify({'message': 'User not found or inactive'}), 401
    new_token = create_access_token(identity=user.id)
    return jsonify({'access_token': new_token}), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200
