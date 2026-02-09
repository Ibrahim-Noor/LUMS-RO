from flask_app import db, bcrypt
from flask_app.models import User, CalendarEvent
from datetime import datetime, timedelta


def seed_data():
    existing_admin = User.query.filter_by(username='admin').first()
    if existing_admin:
        return

    users_data = [
        {
            'username': 'student',
            'email': 'student@lums.edu.pk',
            'password': 'student123',
            'first_name': 'Ali',
            'last_name': 'Ahmed',
            'full_name': 'Ali Ahmed',
            'role': 'student',
            'student_id': '2024-10-0001',
            'department': 'Computer Science',
        },
        {
            'username': 'instructor',
            'email': 'instructor@lums.edu.pk',
            'password': 'instructor123',
            'first_name': 'Dr. Sara',
            'last_name': 'Khan',
            'full_name': 'Dr. Sara Khan',
            'role': 'instructor',
            'department': 'Computer Science',
        },
        {
            'username': 'admin',
            'email': 'admin@lums.edu.pk',
            'password': 'admin123',
            'first_name': 'Registrar',
            'last_name': 'Office',
            'full_name': 'Registrar Office',
            'role': 'admin',
            'department': 'Registrar Office',
        },
    ]

    for u_data in users_data:
        password = u_data.pop('password')
        user = User(**u_data)
        user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        db.session.add(user)

    now = datetime.utcnow()
    events = [
        CalendarEvent(
            title='Spring Semester Begins',
            description='First day of classes for Spring 2026',
            start_date=now + timedelta(days=30),
            type='event',
        ),
        CalendarEvent(
            title='Midterm Examinations',
            description='Midterm examination period',
            start_date=now + timedelta(days=60),
            end_date=now + timedelta(days=67),
            type='exam',
        ),
        CalendarEvent(
            title='Course Registration Deadline',
            description='Last day to add/drop courses',
            start_date=now + timedelta(days=14),
            type='deadline',
        ),
        CalendarEvent(
            title='Pakistan Day Holiday',
            description='University closed for Pakistan Day',
            start_date=now + timedelta(days=45),
            type='holiday',
        ),
    ]
    for event in events:
        db.session.add(event)

    db.session.commit()
    print('[Seed] Demo users and calendar events created successfully.')
