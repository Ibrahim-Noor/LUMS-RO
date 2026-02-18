import pytest
from tests.conftest import get_token, auth_header


class TestLogin:
    def test_login_success(self, client, seed_users):
        resp = client.post('/api/auth/login', json={
            'username': 'teststudent',
            'password': 'pass123',
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'access_token' in data
        assert data['user']['username'] == 'teststudent'
        assert data['user']['role'] == 'student'

    def test_login_wrong_password(self, client, seed_users):
        resp = client.post('/api/auth/login', json={
            'username': 'teststudent',
            'password': 'wrongpass',
        })
        assert resp.status_code == 401
        assert resp.get_json()['message'] == 'Invalid credentials'

    def test_login_nonexistent_user(self, client, seed_users):
        resp = client.post('/api/auth/login', json={
            'username': 'nobody',
            'password': 'pass123',
        })
        assert resp.status_code == 401

    def test_login_missing_fields(self, client, seed_users):
        resp = client.post('/api/auth/login', json={'username': 'teststudent'})
        assert resp.status_code == 400

    def test_login_empty_body(self, client, seed_users):
        resp = client.post('/api/auth/login', content_type='application/json')
        assert resp.status_code == 400

    def test_login_inactive_user(self, client, seed_users, app):
        from flask_app import db
        from flask_app.models import User
        with app.app_context():
            user = User.query.filter_by(username='teststudent').first()
            user.is_active = False
            db.session.commit()

        resp = client.post('/api/auth/login', json={
            'username': 'teststudent',
            'password': 'pass123',
        })
        assert resp.status_code == 403


class TestGetCurrentUser:
    def test_get_user_authenticated(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.get('/api/auth/user', headers=auth_header(token))
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['username'] == 'teststudent'
        assert data['role'] == 'student'

    def test_get_user_no_token(self, client, seed_users):
        resp = client.get('/api/auth/user')
        assert resp.status_code == 401

    def test_get_user_invalid_token(self, client, seed_users):
        resp = client.get('/api/auth/user', headers=auth_header('invalid.token.here'))
        assert resp.status_code == 401


class TestRefreshToken:
    def test_refresh_success(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/auth/refresh', headers=auth_header(token))
        assert resp.status_code == 200
        assert 'access_token' in resp.get_json()

    def test_refresh_no_token(self, client, seed_users):
        resp = client.post('/api/auth/refresh')
        assert resp.status_code == 401


class TestLogout:
    def test_logout(self, client, seed_users):
        resp = client.post('/api/auth/logout')
        assert resp.status_code == 200
        assert resp.get_json()['message'] == 'Logged out successfully'
