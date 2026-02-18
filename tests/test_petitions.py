import pytest
from tests.conftest import get_token, auth_header


class TestListPetitions:
    def test_instructor_sees_own_petitions(self, client, seed_users):
        token = get_token(client, 'testinstructor')
        resp = client.get('/api/petitions', headers=auth_header(token))
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

    def test_admin_sees_all_petitions(self, client, seed_users):
        token = get_token(client, 'testadmin')
        resp = client.get('/api/petitions', headers=auth_header(token))
        assert resp.status_code == 200

    def test_student_sees_empty_list(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.get('/api/petitions', headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.get_json() == []


class TestCreatePetition:
    def _petition_data(self):
        return {
            'studentId': 'STU-001',
            'courseCode': 'CS200',
            'currentGrade': 'B',
            'newGrade': 'A',
            'justification': 'Recalculation of final exam score',
        }

    def test_instructor_create_success(self, client, seed_users):
        token = get_token(client, 'testinstructor')
        resp = client.post('/api/petitions', headers=auth_header(token),
                           json=self._petition_data())
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['courseCode'] == 'CS200'
        assert data['status'] == 'submitted'

    def test_student_cannot_create(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/petitions', headers=auth_header(token),
                           json=self._petition_data())
        assert resp.status_code == 403

    def test_missing_required_field(self, client, seed_users):
        token = get_token(client, 'testinstructor')
        data = self._petition_data()
        del data['justification']
        resp = client.post('/api/petitions', headers=auth_header(token), json=data)
        assert resp.status_code == 400

    def test_duplicate_petition_blocked(self, client, seed_users):
        token = get_token(client, 'testinstructor')
        client.post('/api/petitions', headers=auth_header(token),
                    json=self._petition_data())

        resp = client.post('/api/petitions', headers=auth_header(token),
                           json=self._petition_data())
        assert resp.status_code == 400
        assert 'pending' in resp.get_json()['message'].lower()

    def test_different_course_allowed(self, client, seed_users):
        token = get_token(client, 'testinstructor')
        client.post('/api/petitions', headers=auth_header(token),
                    json=self._petition_data())

        data2 = self._petition_data()
        data2['courseCode'] = 'CS300'
        resp = client.post('/api/petitions', headers=auth_header(token), json=data2)
        assert resp.status_code == 201

    def test_missing_body(self, client, seed_users):
        token = get_token(client, 'testinstructor')
        resp = client.post('/api/petitions', headers=auth_header(token),
                           content_type='application/json')
        assert resp.status_code == 400


class TestUpdatePetitionStatus:
    def _create_petition(self, client, token):
        resp = client.post('/api/petitions', headers=auth_header(token), json={
            'studentId': 'STU-001', 'courseCode': 'CS200',
            'currentGrade': 'B', 'newGrade': 'A',
            'justification': 'Score recalculation',
        })
        return resp.get_json()['id']

    def test_admin_approve(self, client, seed_users):
        i_token = get_token(client, 'testinstructor')
        pet_id = self._create_petition(client, i_token)

        a_token = get_token(client, 'testadmin')
        resp = client.patch(f'/api/petitions/{pet_id}/status',
                            headers=auth_header(a_token),
                            json={'status': 'approved', 'adminComment': 'Approved'})
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'approved'

    def test_admin_reject(self, client, seed_users):
        i_token = get_token(client, 'testinstructor')
        pet_id = self._create_petition(client, i_token)

        a_token = get_token(client, 'testadmin')
        resp = client.patch(f'/api/petitions/{pet_id}/status',
                            headers=auth_header(a_token),
                            json={'status': 'rejected', 'adminComment': 'Insufficient evidence'})
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'rejected'

    def test_instructor_cannot_update_status(self, client, seed_users):
        i_token = get_token(client, 'testinstructor')
        pet_id = self._create_petition(client, i_token)

        resp = client.patch(f'/api/petitions/{pet_id}/status',
                            headers=auth_header(i_token),
                            json={'status': 'approved'})
        assert resp.status_code == 403

    def test_invalid_status(self, client, seed_users):
        i_token = get_token(client, 'testinstructor')
        pet_id = self._create_petition(client, i_token)

        a_token = get_token(client, 'testadmin')
        resp = client.patch(f'/api/petitions/{pet_id}/status',
                            headers=auth_header(a_token),
                            json={'status': 'cancelled'})
        assert resp.status_code == 400

    def test_nonexistent_petition(self, client, seed_users):
        a_token = get_token(client, 'testadmin')
        resp = client.patch('/api/petitions/99999/status',
                            headers=auth_header(a_token),
                            json={'status': 'approved'})
        assert resp.status_code == 404
