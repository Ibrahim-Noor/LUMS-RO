import pytest
from tests.conftest import get_token, auth_header


class TestListMajorApplications:
    def test_student_sees_own(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.get('/api/major-applications', headers=auth_header(token))
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

    def test_admin_sees_all(self, client, seed_users):
        token = get_token(client, 'testadmin')
        resp = client.get('/api/major-applications', headers=auth_header(token))
        assert resp.status_code == 200


class TestCreateMajorApplication:
    def _app_data(self):
        return {
            'requestedMajor': 'Electrical Engineering',
            'school': 'SBASSE',
            'currentMajor': 'Computer Science',
            'statement': 'I want to switch majors.',
        }

    def test_student_create_success(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/major-applications', headers=auth_header(token),
                           json=self._app_data())
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['requestedMajor'] == 'Electrical Engineering'
        assert data['status'] == 'submitted'

    def test_instructor_cannot_create(self, client, seed_users):
        token = get_token(client, 'testinstructor')
        resp = client.post('/api/major-applications', headers=auth_header(token),
                           json=self._app_data())
        assert resp.status_code == 403

    def test_missing_required_fields(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/major-applications', headers=auth_header(token),
                           json={'currentMajor': 'CS'})
        assert resp.status_code == 400

    def test_duplicate_pending_blocked(self, client, seed_users):
        token = get_token(client, 'teststudent')
        client.post('/api/major-applications', headers=auth_header(token),
                    json=self._app_data())
        resp = client.post('/api/major-applications', headers=auth_header(token),
                           json=self._app_data())
        assert resp.status_code == 400
        assert 'pending' in resp.get_json()['message'].lower()

    def test_same_major_blocked_after_approval(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/major-applications', headers=auth_header(token),
                           json=self._app_data())
        app_id = resp.get_json()['id']

        a_token = get_token(client, 'testadmin')
        client.patch(f'/api/major-applications/{app_id}/status',
                     headers=auth_header(a_token),
                     json={'status': 'approved'})

        resp = client.post('/api/major-applications', headers=auth_header(token),
                           json=self._app_data())
        assert resp.status_code == 400
        assert 'already declared' in resp.get_json()['message'].lower()

    def test_missing_body(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/major-applications', headers=auth_header(token),
                           content_type='application/json')
        assert resp.status_code == 400


class TestUpdateMajorApplicationStatus:
    def _create_app(self, client, token):
        resp = client.post('/api/major-applications', headers=auth_header(token), json={
            'requestedMajor': 'Physics',
            'school': 'SBASSE',
            'statement': 'Interest in physics',
        })
        return resp.get_json()['id']

    def test_admin_approve(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        app_id = self._create_app(client, s_token)

        a_token = get_token(client, 'testadmin')
        resp = client.patch(f'/api/major-applications/{app_id}/status',
                            headers=auth_header(a_token),
                            json={'status': 'approved'})
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'approved'

    def test_student_cannot_update_status(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        app_id = self._create_app(client, s_token)

        resp = client.patch(f'/api/major-applications/{app_id}/status',
                            headers=auth_header(s_token),
                            json={'status': 'approved'})
        assert resp.status_code == 403

    def test_invalid_status(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        app_id = self._create_app(client, s_token)

        a_token = get_token(client, 'testadmin')
        resp = client.patch(f'/api/major-applications/{app_id}/status',
                            headers=auth_header(a_token),
                            json={'status': 'cancelled'})
        assert resp.status_code == 400

    def test_nonexistent_application(self, client, seed_users):
        a_token = get_token(client, 'testadmin')
        resp = client.patch('/api/major-applications/99999/status',
                            headers=auth_header(a_token),
                            json={'status': 'approved'})
        assert resp.status_code == 404
