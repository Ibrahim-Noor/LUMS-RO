import pytest
from tests.conftest import get_token, auth_header


class TestListDocumentRequests:
    def test_student_sees_own_requests(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.get('/api/document-requests', headers=auth_header(token))
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

    def test_admin_sees_all_requests(self, client, seed_users):
        token_s = get_token(client, 'teststudent')
        client.post('/api/document-requests', headers=auth_header(token_s), json={
            'type': 'transcript', 'urgency': 'normal', 'copies': 1, 'amount': 500,
        })

        token_a = get_token(client, 'testadmin')
        resp = client.get('/api/document-requests', headers=auth_header(token_a))
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) >= 1

    def test_unauthenticated_blocked(self, client, seed_users):
        resp = client.get('/api/document-requests')
        assert resp.status_code == 401


class TestCreateDocumentRequest:
    def test_student_create_success(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/document-requests', headers=auth_header(token), json={
            'type': 'transcript',
            'urgency': 'normal',
            'copies': 2,
            'amount': 1000,
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['type'] == 'transcript'
        assert data['status'] == 'payment_pending'
        assert data['copies'] == 2

    def test_invalid_type_rejected(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/document-requests', headers=auth_header(token), json={
            'type': 'invalid_type', 'urgency': 'normal',
        })
        assert resp.status_code == 400

    def test_invalid_urgency_rejected(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/document-requests', headers=auth_header(token), json={
            'type': 'transcript', 'urgency': 'super_urgent',
        })
        assert resp.status_code == 400

    def test_duplicate_pending_blocked(self, client, seed_users):
        token = get_token(client, 'teststudent')
        client.post('/api/document-requests', headers=auth_header(token), json={
            'type': 'transcript', 'urgency': 'normal', 'copies': 1, 'amount': 500,
        })
        resp = client.post('/api/document-requests', headers=auth_header(token), json={
            'type': 'degree', 'urgency': 'normal', 'copies': 1, 'amount': 500,
        })
        assert resp.status_code == 400
        assert 'pending' in resp.get_json()['message'].lower()

    def test_instructor_cannot_create(self, client, seed_users):
        token = get_token(client, 'testinstructor')
        resp = client.post('/api/document-requests', headers=auth_header(token), json={
            'type': 'transcript', 'urgency': 'normal',
        })
        assert resp.status_code == 403

    def test_missing_body(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/document-requests', headers=auth_header(token),
                           content_type='application/json')
        assert resp.status_code == 400


class TestUpdateDocumentRequestStatus:
    def _create_request(self, client, token):
        resp = client.post('/api/document-requests', headers=auth_header(token), json={
            'type': 'transcript', 'urgency': 'normal', 'copies': 1, 'amount': 500,
        })
        return resp.get_json()['id']

    def test_admin_update_status(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        req_id = self._create_request(client, s_token)

        a_token = get_token(client, 'testadmin')
        resp = client.patch(f'/api/document-requests/{req_id}/status',
                            headers=auth_header(a_token),
                            json={'status': 'approved', 'adminComment': 'Looks good'})
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'approved'
        assert resp.get_json()['adminComment'] == 'Looks good'

    def test_student_cannot_update_status(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        req_id = self._create_request(client, s_token)

        resp = client.patch(f'/api/document-requests/{req_id}/status',
                            headers=auth_header(s_token),
                            json={'status': 'approved'})
        assert resp.status_code == 403

    def test_invalid_status(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        req_id = self._create_request(client, s_token)

        a_token = get_token(client, 'testadmin')
        resp = client.patch(f'/api/document-requests/{req_id}/status',
                            headers=auth_header(a_token),
                            json={'status': 'invalid_status'})
        assert resp.status_code == 400

    def test_nonexistent_request(self, client, seed_users):
        a_token = get_token(client, 'testadmin')
        resp = client.patch('/api/document-requests/99999/status',
                            headers=auth_header(a_token),
                            json={'status': 'approved'})
        assert resp.status_code == 404
