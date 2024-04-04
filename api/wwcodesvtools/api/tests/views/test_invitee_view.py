from django.test import TransactionTestCase
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from api.helper_functions import generate_registration_token
import json


class InviteeModelTest(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json', 'invitee.json']
    DIRECTOR_EMAIL = 'director@example.com'
    LEADER_EMAIL = 'leader@example.com'
    PASSWORD = 'Password123'

    def setUp(self):
        self.access_token = self.get_token(self.DIRECTOR_EMAIL, self.PASSWORD)
        self.bearer = {'HTTP_AUTHORIZATION': 'Bearer {}'.format(self.access_token)}

    def get_token(self, username, password):
        s = TokenObtainPairSerializer(data={
            TokenObtainPairSerializer.username_field: username,
            'password': password,
        })
        self.assertTrue(s.is_valid())
        return s.validated_data['access']

    # Testing GET invitee list endpoint authenticated with
    # a user with Director role
    def test_invitee_list_for_director(self):
        response = self.client.get("/api/invitee/", **self.bearer)
        data_json = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(data_json), 7)

    # Testing GET invitee list endpoint authenticated
    # a user with Leader role
    def test_invalid_access_to_invitee_list(self):
        access_token = self.get_token(self.LEADER_EMAIL, self.PASSWORD)
        bearer = {'HTTP_AUTHORIZATION': 'Bearer {}'.format(access_token)}
        response = self.client.get("/api/invitee/", **bearer)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Testing CREATE invitee endpoint
    def test_invitee_create(self):
        json_type = "application/json"
        data = json.dumps({"email": "user@example.com",
                           "message": "string",
                           "role": 1,
                           "registration_token": generate_registration_token(),
                           "resent_counter": 0,
                           "created_by": 1
                           })
        response = self.client.post("/api/invitee/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', json.loads(response.content))

    # Testing GET invitee by id endpoint
    def test_invitee_read_for_director(self):
        response = self.client.get("/api/invitee/1/", **self.bearer)
        self.assertEqual(response.data['email'], 'volunteer@example.com')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # Testing PATCH invitee endpoint
    def test_invitee_patch(self):
        json_type = "application/json"
        data = json.dumps({"email": "volunteer2@example.com"})
        response = self.client.patch("/api/invitee/1/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code,  status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'volunteer2@example.com')

    # Testing DELETE invitee endpoint
    def test_delete_invitee_by_id_for_director(self):
        response = self.client.delete("/api/invitee/2/", **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # Testing resend invitee endpoint
    def test_resend_invitation_by_id_for_director(self):
        json_type = "application/json"
        data = json.dumps({"email": "volunteer_3@example.com"})
        response = self.client.patch("/api/invitee/3/resend/", data, **self.bearer, accept=json_type, content_type=json_type)
        response_content = json.loads(response.content)
        print(response_content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # Testing GET invitee endpoint with search by email
    def test_get_with_search_email(self):
        response = self.client.get('/api/invitee/?search=sophie', **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        for invitee in data:
            self.assertTrue(invitee['email'].lower().startswith("sophie"))

    # Testing GET invitee endpoint with search: no match by email
    def test_get_with_search_email_no_match(self):
        response = self.client.get('/api/invitee/?search=no_match_email', **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    # Testing GET invitee endpoint default order
    # the default order is desc by upated_by
    def test_get_default_ordering(self):
        response = self.client.get('/api/invitee/', **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        updated_at_values = [invitee['updated_at'] for invitee in data]
        self.assertEqual(updated_at_values, sorted(updated_at_values, reverse=True))

    # Testing GET invitee endpoint ordering by email
    def test_get_ordering_by_email(self):
        response = self.client.get('/api/invitee/?ordering=email', **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        email_values = [invitee['email'] for invitee in data]
        self.assertEqual(email_values, sorted(email_values))

    # Testing GET invitee endpoint ordering by status
    def test_get_ordering_by_status_invitee_and_default_order(self):
        response = self.client.get('/api/invitee/?ordering=status', **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        prev_status = None
        prev_updated_at = None
        for invitee in data:
            if prev_status is not None:
                self.assertLessEqual(prev_status, invitee['status'])
                if prev_status == invitee['status']:
                    self.assertGreaterEqual(prev_updated_at, invitee['updated_at'])
            prev_status = invitee['status']
            prev_updated_at = invitee['updated_at']

    # Testing GET invitee endpoint ordering by role
    def test_get_ordering_by_role_invitee_and_default_order(self):
        response = self.client.get('/api/invitee/?ordering=role_name', **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        prev_role = None
        prev_updated_at = None
        for invitee in data:
            if prev_role is not None:
                self.assertLessEqual(prev_role, invitee['role_name'])
                if prev_role == invitee['role_name']:
                    self.assertGreaterEqual(prev_updated_at, invitee['updated_at'])
            prev_role = invitee['role_name']
            prev_updated_at = invitee['updated_at']

    # Testing GET invitee endpoint search by email and ordering by role
    def test_get_search_email_ordering_by_role_and_default_order(self):
        response = self.client.get('/api/invitee/?ordering=role_name&search=volunteer', **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        prev_role = None
        prev_updated_at = None
        for invitee in data:
            if prev_role is not None:
                self.assertLessEqual(prev_role, invitee['role_name'])
                if prev_role == invitee['role_name']:
                    self.assertGreaterEqual(prev_updated_at, invitee['updated_at'])
            self.assertTrue(invitee['email'].lower().startswith("volunteer"))
            prev_role = invitee['role_name']
            prev_updated_at = invitee['updated_at']
