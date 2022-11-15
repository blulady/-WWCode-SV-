import json
from django.test import TransactionTestCase
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status


class UserViewTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json']

    ERROR_INVALID_NAME = 'Either name was blank or name length not in range of 1-50 characters'
    SUCCESS_NAME_CHANGE = 'Name change was successful'

    def setUp(self):
        self.username = "volunteer@example.com"
        self.password = "Password123"
        self.access_token = self.get_token(self.username, self.password)
        self.bearer = {'HTTP_AUTHORIZATION': 'Bearer {}'.format(self.access_token)}

    def get_token(self, username, password):
        s = TokenObtainPairSerializer(data={
            TokenObtainPairSerializer.username_field: username,
            'password': self.password,
        })
        self.assertTrue(s.is_valid())
        return s.validated_data['access']

    def patch_request(self, data, bearer):
        change_name_api_url = "/api/user/name/"
        return self.client.patch(change_name_api_url, data, **bearer, accept="application/json", content_type="application/json",)

    def test_change_name_success(self):
        data = {"first_name": "Alice", "last_name": "Robinson"}
        # TODO Write assertion to check that the name in updated in the db.
        response = self.patch_request(data, self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)['success'], self.SUCCESS_NAME_CHANGE)

    def test_change_name_blank(self):
        data = {"first_name": "", "last_name": ""}
        response = self.patch_request(data, self.bearer)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['error'], self.ERROR_INVALID_NAME)

    def test_first_name_too_long(self):
        data = {"first_name": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz", "last_name": "Robinson"}
        response = self.patch_request(data, self.bearer)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['error'], self.ERROR_INVALID_NAME)

    def test_last_name_too_long(self):
        data = {"first_name": "Alice", "last_name": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"}
        response = self.patch_request(data, self.bearer)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['error'], self.ERROR_INVALID_NAME)

# TODO write testcase for attempted name change for pending member return 403
