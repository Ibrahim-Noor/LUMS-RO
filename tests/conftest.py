import pytest
import os

from flask_app import create_app, db, bcrypt
from flask_app.models import User


TEST_CONFIG = {
    'SQLALCHEMY_DATABASE_URI': 'sqlite://',
    'TESTING': True,
    'JWT_SECRET_KEY': 'test-secret-key',
}


@pytest.fixture(scope='function')
def app():
    old_env = os.environ.pop('NODE_ENV', None)
    old_depl = os.environ.pop('REPL_DEPLOYMENT', None)

    test_app = create_app(test_config=TEST_CONFIG)

    with test_app.app_context():
        db.create_all()
        yield test_app
        db.session.remove()
        db.drop_all()

    if old_env:
        os.environ['NODE_ENV'] = old_env
    if old_depl:
        os.environ['REPL_DEPLOYMENT'] = old_depl


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def seed_users(app):
    with app.app_context():
        users = {}
        for role, data in [
            ('student', {
                'username': 'teststudent',
                'email': 'student@test.com',
                'password': 'pass123',
                'first_name': 'Test',
                'last_name': 'Student',
                'full_name': 'Test Student',
                'role': 'student',
                'student_id': 'STU-001',
                'department': 'CS',
            }),
            ('instructor', {
                'username': 'testinstructor',
                'email': 'instructor@test.com',
                'password': 'pass123',
                'first_name': 'Test',
                'last_name': 'Instructor',
                'full_name': 'Test Instructor',
                'role': 'instructor',
                'department': 'CS',
            }),
            ('admin', {
                'username': 'testadmin',
                'email': 'admin@test.com',
                'password': 'pass123',
                'first_name': 'Test',
                'last_name': 'Admin',
                'full_name': 'Test Admin',
                'role': 'admin',
                'department': 'Admin',
            }),
        ]:
            password = data.pop('password')
            user = User(**data)
            user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            db.session.add(user)
            db.session.flush()
            users[role] = user
        db.session.commit()
        return users


def get_token(client, username='teststudent', password='pass123'):
    resp = client.post('/api/auth/login', json={
        'username': username,
        'password': password,
    })
    return resp.get_json()['access_token']


def auth_header(token):
    return {'Authorization': f'Bearer {token}'}
