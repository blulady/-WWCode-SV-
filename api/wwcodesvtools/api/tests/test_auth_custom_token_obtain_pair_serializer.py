from unittest.mock import MagicMock
from django.test import TransactionTestCase
from rest_framework import exceptions as drf_exceptions
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from ..models import UserProfile, User, Role, User_Team
from api.serializers.UserProfileSerializer import UserProfileSerializer
from api.serializers.CustomTokenObtainPairSerializer import CustomTokenObtainPairSerializer
from django.conf import settings


class AuthCustomTokenObtainPairSerializerTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json']

    def setUp(self):
        self.username = 'Mark_Doe@example.com'
        self.first_name = 'Mark'
        self.last_name = 'Doe'
        self.password = 'test_password1'
        self.email = 'Mark_Doe@example.com'

        self.user = User.objects.create_user(
            username=self.username,
            password=self.password,
            email=self.email,
            first_name=self.first_name,
            last_name=self.last_name
        )
        self.user_profile = UserProfile.objects.get(user_id=self.user.id)
        userProfile = UserProfileSerializer(instance=self.user_profile, data={
            "status": UserProfile.ACTIVE
        })
        userProfile.is_valid()
        self.user_profile = userProfile.save()
        role = Role.objects.get(name=Role.VOLUNTEER)
        userteam = User_Team(user=self.user, role=role)
        userteam.save()

    def test_it_should_produce_json_web_token_and_user_info_when_valid(self):
        s = CustomTokenObtainPairSerializer(context=MagicMock(), data={
            CustomTokenObtainPairSerializer.username_field: self.username,
            'password': self.password,
        })

        self.assertTrue(s.is_valid())
        self.assertIn('access', s.validated_data)
        self.assertIn('refresh', s.validated_data)
        self.assertIn('id', s.validated_data)
        self.assertIn('access_expiry_in_sec', s.validated_data)
        self.assertIn('refresh_expiry_in_sec', s.validated_data)
        self.assertEquals(s.validated_data['email'], 'Mark_Doe@example.com')
        self.assertEquals(s.validated_data['first_name'], 'Mark')
        self.assertEquals(s.validated_data['last_name'], 'Doe')
        self.assertEqual(s.validated_data['role'], Role.VOLUNTEER)
        AccessToken(s.validated_data['access'])
        RefreshToken(s.validated_data['refresh'])
        self.assertEquals(s.validated_data['access_expiry_in_sec'], (settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']))
        self.assertEquals(s.validated_data['refresh_expiry_in_sec'], (settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']))

    def test_it_should_produce_json_web_token_and_show_highest_role_for_user(self):
        self.username = 'sophiebutler@example.com'
        self.password = 'Password123'
        s = CustomTokenObtainPairSerializer(context=MagicMock(), data={
            CustomTokenObtainPairSerializer.username_field: self.username,
            'password': self.password,
        })

        self.assertTrue(s.is_valid())
        self.assertIn('access', s.validated_data)
        self.assertIn('refresh', s.validated_data)
        self.assertIn('id', s.validated_data)
        self.assertIn('access_expiry_in_sec', s.validated_data)
        self.assertIn('refresh_expiry_in_sec', s.validated_data)
        self.assertEquals(s.validated_data['email'], 'sophiebutler@example.com')
        self.assertEquals(s.validated_data['first_name'], 'Sophie')
        self.assertEquals(s.validated_data['last_name'], 'Butler')
        self.assertEqual(s.validated_data['role'], Role.DIRECTOR)
        AccessToken(s.validated_data['access'])
        RefreshToken(s.validated_data['refresh'])
        self.assertEquals(s.validated_data['access_expiry_in_sec'], (settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']))
        self.assertEquals(s.validated_data['refresh_expiry_in_sec'], (settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']))

    def test_it_should_raise_error_if_user_status_not_active(self):
        self.user_profile.status = UserProfile.INACTIVE
        self.user_profile.save()

        s = CustomTokenObtainPairSerializer(context=MagicMock(), data={
            CustomTokenObtainPairSerializer.username_field: self.username,
            'password': self.password,
        })

        with self.assertRaises(drf_exceptions.AuthenticationFailed):
            s.is_valid()
