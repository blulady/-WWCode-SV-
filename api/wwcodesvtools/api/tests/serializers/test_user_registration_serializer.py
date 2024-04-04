from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from api.serializers.UserRegistrationSerializer import UserRegistrationSerializer


class UserRegistrationSerializerTest(TestCase):

    def test_create_user(self):
        serializer = UserRegistrationSerializer()
        user_data = {
            'email': 'john.doe@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'username': 'john.doe@example.com',
            'password': 'test_Password123'
        }
        created_user = serializer.create(user_data)
        # Check if the user is an instance of the User model
        self.assertIsInstance(created_user, User)
        # Check if the user is saved in the database
        self.assertTrue(User.objects.filter(username='john.doe@example.com').exists())
        # Check if the password is encrypted
        stored_user = User.objects.get(username='john.doe@example.com')
        self.assertTrue(check_password('test_Password123', stored_user.password))
        # Check if the user is active
        self.assertTrue(stored_user.is_active)

    def test_validate_email_username_same(self):
        serializer = UserRegistrationSerializer()
        data = {
            'email': 'john.doe@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'username': 'john.doe@example.com',
            'password': 'test_Password123'
        }
        validated_data = serializer.validate(data)
        self.assertEqual(validated_data, data)

    def test_validate_email_username_different(self):
        serializer = UserRegistrationSerializer()
        data = {
            'email': 'john.doe@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'username': 'john_doe',
            'password': 'test_Password123'
        }
        with self.assertRaises(serializers.ValidationError) as error:
            serializer.validate(data)
        self.assertEqual(str(error.exception.detail['email_username']), "Email and Username should be same")

    def test_invalid_password_fails(self):
        serializer = UserRegistrationSerializer()
        data = {
            'email': 'john.doe@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'username': 'john_doe',
            'password': ''
        }
        with self.assertRaises(serializers.ValidationError):
            serializer.validate(data)

    def test_invalid_first_name_fails(self):
        serializer = UserRegistrationSerializer()
        data = {
            'email': 'john.doe@example.com',
            'first_name': 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
            'last_name': 'Doe',
            'username': 'john_doe',
            'password': 'test_password123'
        }
        with self.assertRaises(serializers.ValidationError):
            serializer.validate(data)

    def test_invalid_last_name_fails(self):
        serializer = UserRegistrationSerializer()
        data = {
            'email': 'john.doe@example.com',
            'first_name': 'john',
            'last_name': '',
            'username': 'john_doe',
            'password': 'test_password123'
        }
        with self.assertRaises(serializers.ValidationError):
            serializer.validate(data)
