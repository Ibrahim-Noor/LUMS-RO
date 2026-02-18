import pytest
from tests.conftest import get_token, auth_header


class TestCalendarEvents:
    def test_list_events_authenticated(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.get('/api/calendar', headers=auth_header(token))
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

    def test_list_events_unauthenticated(self, client, seed_users):
        resp = client.get('/api/calendar')
        assert resp.status_code == 401

    def test_admin_create_event(self, client, seed_users):
        token = get_token(client, 'testadmin')
        resp = client.post('/api/calendar', headers=auth_header(token), json={
            'title': 'Final Exams',
            'description': 'End of semester exams',
            'startDate': '2026-06-01T09:00:00Z',
            'endDate': '2026-06-10T17:00:00Z',
            'type': 'exam',
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['title'] == 'Final Exams'
        assert data['type'] == 'exam'

    def test_student_cannot_create_event(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.post('/api/calendar', headers=auth_header(token), json={
            'title': 'Test Event',
            'startDate': '2026-06-01T09:00:00Z',
            'type': 'event',
        })
        assert resp.status_code == 403

    def test_invalid_event_type(self, client, seed_users):
        token = get_token(client, 'testadmin')
        resp = client.post('/api/calendar', headers=auth_header(token), json={
            'title': 'Test',
            'startDate': '2026-06-01T09:00:00Z',
            'type': 'party',
        })
        assert resp.status_code == 400

    def test_missing_required_fields(self, client, seed_users):
        token = get_token(client, 'testadmin')
        resp = client.post('/api/calendar', headers=auth_header(token), json={
            'description': 'Missing title and date',
        })
        assert resp.status_code == 400

    def test_invalid_date_format(self, client, seed_users):
        token = get_token(client, 'testadmin')
        resp = client.post('/api/calendar', headers=auth_header(token), json={
            'title': 'Test', 'startDate': 'not-a-date', 'type': 'event',
        })
        assert resp.status_code == 400

    def test_all_event_types(self, client, seed_users):
        token = get_token(client, 'testadmin')
        for etype in ['holiday', 'exam', 'deadline', 'event']:
            resp = client.post('/api/calendar', headers=auth_header(token), json={
                'title': f'Test {etype}',
                'startDate': '2026-07-01T09:00:00Z',
                'type': etype,
            })
            assert resp.status_code == 201


class TestPayments:
    def _create_doc_request(self, client, token):
        resp = client.post('/api/document-requests', headers=auth_header(token), json={
            'type': 'transcript', 'urgency': 'normal', 'copies': 1, 'amount': 500,
        })
        return resp.get_json()['id']

    def test_process_payment_success(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        req_id = self._create_doc_request(client, s_token)

        resp = client.post('/api/payments', headers=auth_header(s_token), json={
            'requestId': req_id, 'amount': 500, 'method': 'online',
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['status'] == 'paid'
        assert data['method'] == 'online'
        assert data['transactionId'] is not None

    def test_payment_updates_doc_status(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        req_id = self._create_doc_request(client, s_token)

        client.post('/api/payments', headers=auth_header(s_token), json={
            'requestId': req_id, 'amount': 500, 'method': 'online',
        })

        resp = client.get('/api/document-requests', headers=auth_header(s_token))
        docs = resp.get_json()
        doc = next(d for d in docs if d['id'] == req_id)
        assert doc['status'] == 'pending_approval'

    def test_voucher_payment(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        req_id = self._create_doc_request(client, s_token)

        resp = client.post('/api/payments', headers=auth_header(s_token), json={
            'requestId': req_id, 'amount': 500, 'method': 'voucher',
        })
        assert resp.status_code == 200
        assert resp.get_json()['method'] == 'voucher'

    def test_invalid_payment_method(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        req_id = self._create_doc_request(client, s_token)

        resp = client.post('/api/payments', headers=auth_header(s_token), json={
            'requestId': req_id, 'amount': 500, 'method': 'bitcoin',
        })
        assert resp.status_code == 400

    def test_missing_fields(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        resp = client.post('/api/payments', headers=auth_header(s_token), json={
            'method': 'online',
        })
        assert resp.status_code == 400

    def test_nonexistent_doc_request(self, client, seed_users):
        s_token = get_token(client, 'teststudent')
        resp = client.post('/api/payments', headers=auth_header(s_token), json={
            'requestId': 99999, 'amount': 500, 'method': 'online',
        })
        assert resp.status_code == 404


class TestNotifications:
    def test_list_notifications(self, client, seed_users):
        token = get_token(client, 'teststudent')
        resp = client.get('/api/notifications', headers=auth_header(token))
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

    def test_unauthenticated_blocked(self, client, seed_users):
        resp = client.get('/api/notifications')
        assert resp.status_code == 401
