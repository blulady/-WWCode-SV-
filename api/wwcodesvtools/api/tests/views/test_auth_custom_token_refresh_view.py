import json
from django.test import TransactionTestCase
from rest_framework import status
from api.serializers.CustomTokenObtainPairSerializer import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken


class CustomTokenRefreshViewTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json']
    DIRECTOR_EMAIL = 'director@example.com'
    PASSWORD = 'Password123'

    def setUp(self):
        self.access_token, self.refresh_token = self.get_tokens(self.DIRECTOR_EMAIL, self.PASSWORD)
        self.bearer = {'HTTP_AUTHORIZATION': 'Bearer {}'.format(self.access_token)}

    def get_tokens(self, username, password):
        s = CustomTokenObtainPairSerializer(data={
            CustomTokenObtainPairSerializer.username_field: username,
            'password': password,
        })
        self.assertTrue(s.is_valid())
        return s.validated_data['access'], s.validated_data['refresh']

    '''
    When the user request a refresh token, the new token should be added
    to the outstanding tokens
    '''
    def test_new_refresh_token_is_added_to_outstanding_tokens_upon_generation(self):
        json_type = "application/json"
        data = json.dumps({"refresh": self.refresh_token})
        response = self.client.post("/api/login/refresh/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(OutstandingToken.objects.filter(token=self.refresh_token).exists(), True)

    '''
    When the user request a refresh token, the new refresh token and access token
    are returned in the response
    '''
    def test_refresh_token_and_access_token_are_returned_sucessfully(self):
        json_type = "application/json"
        data = json.dumps({"refresh": self.refresh_token})
        response = self.client.post("/api/login/refresh/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('refresh', response.data)
        self.assertIn('access', response.data)

    '''
    When the user request a refresh token, the current refresh token should
    be send in the request. If not it's a bad request.
    '''
    def test_it_returns_bad_request_if_refresh_token_is_blank(self):
        json_type = "application/json"
        data = json.dumps({"refresh": ''})
        response = self.client.post("/api/login/refresh/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    '''
    When the user request a refresh token using a blacklisted token, the response
    should be a bad request code.
    '''
    def test_it_returns_bad_request_if_refresh_token_is_blacklisted(self):
        json_type = "application/json"
        data = json.dumps({"refresh": self.refresh_token})
        response = self.client.post("/api/login/refresh/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Trying to get a new refresh token using the same refresh token which
        # is now blacklisted since the previous request was successful
        response = self.client.post("/api/login/refresh/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
