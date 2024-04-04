from django.test import TransactionTestCase
from rest_framework import status
from api.serializers.CustomTokenObtainPairSerializer import CustomTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from ..views.LogoutView import LogoutView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken


class LogoutViewTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json']
    DIRECTOR_EMAIL = 'director@example.com'
    PASSWORD = 'Password123'

    def setUp(self):
        self.access_token, self.refresh_token, self.user_id = self.get_tokens_and_user_id(self.DIRECTOR_EMAIL, self.PASSWORD)
        self.bearer = {'HTTP_AUTHORIZATION': 'Bearer {}'.format(self.access_token)}

    def get_tokens_and_user_id(self, username, password):
        s = CustomTokenObtainPairSerializer(data={
            CustomTokenObtainPairSerializer.username_field: username,
            'password': password,
        })
        self.assertTrue(s.is_valid())
        return s.validated_data['access'], s.validated_data['refresh'], s.validated_data['id']

    '''
    The user logs in and without refreshing the token or open a new session,
    requests to logout.
    The refresh token generated when the user logs in should be blacklisted
    after logout.
    '''
    def test_refresh_token_for_the_very_first_session_is_blacklisted_after_logout(self):
        # The refresh token should be in the outstandig tokens
        outstanding_token_for_user_first_session = OutstandingToken.objects.filter(token=self.refresh_token).first()
        self.assertIsNotNone(outstanding_token_for_user_first_session)

        # Logout request from the first session
        logout_response = self.client.post("/api/logout/", **self.bearer)
        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)

        # Check that the first refresh token is now blacklisted
        self.assertEqual(BlacklistedToken.objects.filter(token_id=outstanding_token_for_user_first_session.id).exists(), True)

    '''
    The user logs in in one client(device, browser), then using another client logs in again.
    Then requests to logout from the frist one.
    The user should be logged out from all sessions,
    In this case, both refresh tokens should be blacklisted
    '''
    def test_multiple_sessions_all_refresh_tokens_are_blacklisted_after_logout(self):
        # Other sesion
        other_access_token, other_refresh_token, same_user_id = self.get_tokens_and_user_id(self.DIRECTOR_EMAIL, self.PASSWORD)
        self.bearer = {'HTTP_AUTHORIZATION': 'Bearer {}'.format(self.access_token)}

        # Both tokens should be in the outstandig tokens
        outstanding_token_for_user_first_session = OutstandingToken.objects.filter(token=other_refresh_token).first()
        self.assertIsNotNone(outstanding_token_for_user_first_session)

        outstanding_token_for_same_user_other_session = OutstandingToken.objects.filter(token=other_refresh_token).first()
        self.assertIsNotNone(outstanding_token_for_same_user_other_session)

        # Logout request from the first session
        logout_response = self.client.post("/api/logout/", **self.bearer)
        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)

        # Check that both tokens from the first and the other session are now blacklisted
        self.assertEqual(BlacklistedToken.objects.filter(token_id=outstanding_token_for_user_first_session.id).exists(), True)
        self.assertEqual(BlacklistedToken.objects.filter(token_id=outstanding_token_for_same_user_other_session.id).exists(), True)

    '''
    In general, when a logout request is received, the user should be logged out from all sessions.
    All the refresh tokens for the user should be blacklisted.
    '''
    def test_all_refresh_tokens_for_user_are_blacklisted_after_logout(self):
        logout_response = self.client.post("/api/logout/", **self.bearer)
        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)

        # Check that all tokens are now blacklisted
        outstanding_tokens_for_user = OutstandingToken.objects.filter(user=self.user_id)
        for token in outstanding_tokens_for_user:
            self.assertEqual(BlacklistedToken.objects.filter(id=token.id).exists(), True)

    '''
    The logout view requires that the user be authenticated
    '''
    def test_logout_view_permissions(self):
        view_permissions = LogoutView().permission_classes
        self.assertEqual(len(view_permissions), 1)
        self.assertEqual(view_permissions[0], IsAuthenticated)
