from unittest.mock import MagicMock
from django.test import TestCase
from rest_framework import exceptions as drf_exceptions
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from ..models import UserProfile, User, RegistrationToken
from api.serializers.UserProfileSerializer import UserProfileSerializer
from api.serializers.CustomTokenObtainPairSerializer import CustomTokenObtainPairSerializer
from django.conf import settings


class AuthCustomTokenObtainPairSerializerTestCase(TestCase):
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
        self.registration_token = RegistrationToken.objects.get(user_id=self.user.id)
        self.user_profile = UserProfile.objects.get(user_id=self.user.id)
        userProfile = UserProfileSerializer(instance=self.user_profile, data={
            "status": 'ACTIVE',
            "role": 'VOLUNTEER'
        })
        userProfile.is_valid()
        self.user_profile = userProfile.save()

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
        self.assertEqual(s.validated_data['role'], UserProfile.VOLUNTEER)
        AccessToken(s.validated_data['access'])
        RefreshToken(s.validated_data['refresh'])
        self.assertEquals(s.validated_data['access_expiry_in_sec'], (settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']))
        self.assertEquals(s.validated_data['refresh_expiry_in_sec'], (settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']))

    def test_it_should_raise_if_user_status_not_active(self):
        self.user_profile.status = 'PENDING'
        self.user_profile.save()

        s = CustomTokenObtainPairSerializer(context=MagicMock(), data={
            CustomTokenObtainPairSerializer.username_field: self.username,
            'password': self.password,
        })

        with self.assertRaises(drf_exceptions.AuthenticationFailed):
            s.is_valid()
