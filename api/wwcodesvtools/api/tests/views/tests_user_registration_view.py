from django.test import TransactionTestCase
from django.contrib.auth.models import User
from rest_framework import status
from ...models import Invitee, Role, User_Team, UserProfile
from rest_framework.permissions import AllowAny
from ...views.UserRegistrationView import UserRegistrationView
from api.helper_functions import generate_registration_token


class UserRegistrationViewTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json', 'invitee.json']
    CONTENT_TYPE_APPLICATION_JSON = "application/json"
    DIRECTOR_EMAIL = 'director@example.com'
    PASSWORD = 'Password123'
    reg_token = generate_registration_token()

    def create_invitee(self):
        invitee = Invitee(email="volunteer1@example.com",
                          message="Invitee testing",
                          role=Role.objects.get(name='VOLUNTEER'),
                          registration_token=self.reg_token,
                          resent_counter=0,
                          created_by=User.objects.get(email=self.DIRECTOR_EMAIL)
                          )
        invitee.save()

    def setUp(self):
        self.create_invitee()
        self.registration_request_data = {
            "email": "volunteer1@example.com",
            "first_name": "Caroline",
            "last_name": "Miller",
            "password": "Password123",
            "token": self.reg_token,
        }

    def __send_request(self, data):
        registration_api_url = "/api/user/activate/"
        return self.client.post(
            registration_api_url,
            data,
            accept=self.CONTENT_TYPE_APPLICATION_JSON,
            content_type=self.CONTENT_TYPE_APPLICATION_JSON,
        )

    def __perform_response_assertions(self, resp, expected_status, expected_error):
        self.assertEqual(resp.status_code, expected_status)
        self.assertEqual(resp["content-type"], self.CONTENT_TYPE_APPLICATION_JSON)
        self.assertEqual(resp.data["error"], expected_error)

    # Test new user can complete registration
    def test_successful_user_registration(self):
        """
        Test to verify that on a POST call with a new user having valid token, registration is successful

        """
        resp = self.__send_request(self.registration_request_data)
        successfully_updated_status_code = 201
        self.assertIs(resp.status_code, successfully_updated_status_code)
        self.assertEqual(resp["content-type"], self.CONTENT_TYPE_APPLICATION_JSON)
        self.assertEqual(resp.data["result"], "User Registered Successfully")
        user_email = self.registration_request_data["email"]
        # Check new user was created
        self.assertEqual(User.objects.filter(email=user_email).exists(), True)
        # Check new user-role-team was created
        self.assertEqual(User_Team.objects.filter(user_id=User.objects.get(email=user_email).id).exists(), True)
        # Check the invitee is deleted
        self.assertRaises(Invitee.DoesNotExist, Invitee.objects.get, email=user_email)
        # Check user status is ACTIVE
        registered_user = User.objects.get(email=user_email)
        self.assertEqual(registered_user.userprofile.status, UserProfile.ACTIVE)

    # Test with password field missing in request data
    def test_password_required_fail(self):
        """
        Test to verify that a POST call with no password data returns bad request error response.
        Error message specifies password field is required.
        """
        self.registration_request_data.pop("password")
        expected_error = "Invalid Request. Key not present in request : 'password'"
        resp = self.__send_request(self.registration_request_data)
        self.__perform_response_assertions(resp, status.HTTP_400_BAD_REQUEST, expected_error)

    # Test new user with token missing in request data
    def test_token_required_fail(self):
        """
        Test to verify that a POST call with no token data returns bad request error response
        """
        self.registration_request_data.pop("token")
        expected_error = "Invalid Request. Key not present in request : 'token'"
        resp = self.__send_request(self.registration_request_data)
        self.__perform_response_assertions(resp, status.HTTP_400_BAD_REQUEST, expected_error)

    # Test new user with email missing in request data
    def test_email_required_fail(self):
        """
        Test to verify that a POST call with no token data returns bad request error response
        """
        self.registration_request_data.pop("email")
        expected_error = "Invalid Request. Key not present in request : 'email'"
        resp = self.__send_request(self.registration_request_data)
        self.__perform_response_assertions(resp, status.HTTP_400_BAD_REQUEST, expected_error)

    # Test new user with first name missing in request data
    def test_first_name_required_fail(self):
        """
        Test to verify that a POST call with no token data returns bad request error response
        """
        self.registration_request_data.pop("first_name")
        expected_error = "Invalid Request. Key not present in request : 'first_name'"
        resp = self.__send_request(self.registration_request_data)
        self.__perform_response_assertions(resp, status.HTTP_400_BAD_REQUEST, expected_error)

    # Test new user with last name missing in request data
    def test_last_name_required_fail(self):
        """
        Test to verify that a POST call with no token data returns bad request error response
        """
        self.registration_request_data.pop("last_name")
        expected_error = "Invalid Request. Key not present in request : 'last_name'"
        resp = self.__send_request(self.registration_request_data)
        self.__perform_response_assertions(resp, status.HTTP_400_BAD_REQUEST, expected_error)

    # Test new valid user with non-existing token
    def test_invalid_token_fail(self):
        """
        Test to verify that a POST call with valid user but non-existing token return invalid token
        response.
        """
        invalid_token = generate_registration_token()
        self.registration_request_data["token"] = invalid_token
        expected_error = "Invalid token. Token in request does not match the token generated for this user."
        resp = self.__send_request(self.registration_request_data)
        self.__perform_response_assertions(resp, status.HTTP_400_BAD_REQUEST, expected_error)

    # Test invited email with mismatched token
    def test_newuser_mismatched_token(self):
        """
        Test to verify that a POST request with valid new user and mismatched valid token
        returns invalid token response.
        """
        self.registration_request_data["token"] = "0223ed8f8936448dafd37088c955333420210219015606"
        expected_error = "Invalid token. Token in request does not match the token generated for this user."
        resp = self.__send_request(self.registration_request_data)
        self.__perform_response_assertions(resp, status.HTTP_400_BAD_REQUEST, expected_error)

    # Test user with Invalid email sent to register
    def test_invalid_not_present_in_db_email_fail(self):
        """
        Test to verify that a post call with the User with Invalid email registration fails.
        Returns error response.
        """
        self.registration_request_data["email"] = "test_invalidemail@domain.com"
        expected_error = "Email does not exist in our invites system. You need to be invited to be able to register."
        resp = self.__send_request(self.registration_request_data)
        self.__perform_response_assertions(resp, status.HTTP_404_NOT_FOUND, expected_error)

    # Test user with invalid minimum password length sent to register
    def test_invalid_password_min_length_fail(self):
        """
        Test to verify that a post call with the User with invalid password(less than 8 characteres) fails.
        Returns error response.
        """
        self.registration_request_data["password"] = "Pas1"
        expected_error = "Password should be a minimum of 8 and maximum of 50 characters long"
        resp = self.__send_request(self.registration_request_data)
        self.assertIn(expected_error, resp.data["error"])

    # Test user with invalid maximum password length sent to register
    def test_invalid_password_max_length_fail(self):
        """
        Test to verify that a post call with the User with invalid password(more than 50 characters) fails.
        Returns error response.
        """
        self.registration_request_data["password"] = "Pas1" + "a"*50
        expected_error = "Password should be a minimum of 8 and maximum of 50 characters long"
        resp = self.__send_request(self.registration_request_data)
        self.assertIn(expected_error, resp.data["error"])

    # Test user with password without uppercase letter sent to register
    def test_invalid_password_no_uppercase_fail(self):
        """
        Test to verify that a post call with the User with invalid password (no uppercase letter) fails.
        Returns error response.
        """
        self.registration_request_data["password"] = "password123"
        expected_error = "Password should have at least one uppercase letter"
        resp = self.__send_request(self.registration_request_data)
        self.assertIn(expected_error, resp.data["error"])

    # Test user with password without lowercase letter sent to register
    def test_invalid_password_no_lowercase_fail(self):
        """
        Test to verify that a post call with the User with invalid password (no lowercase letter) fails.
        Returns error response.
        """
        self.registration_request_data["password"] = "PASSWORD123"
        expected_error = "Password should have at least one lowercase letter"
        resp = self.__send_request(self.registration_request_data)
        self.assertIn(expected_error, resp.data["error"])

    # Test user with password without a number sent to register
    def test_invalid_password_no_number_fail(self):
        """
        Test to verify that a post call with the User with invalid password (no number) fails.
        Returns error response.
        """
        self.registration_request_data["password"] = "PASSWORDtest"
        expected_error = "Password should have at least one number"
        resp = self.__send_request(self.registration_request_data)
        self.assertIn(expected_error, resp.data["error"])

    def test_user_registration_view_permissions(self):
        view_permissions = UserRegistrationView().permission_classes
        self.assertEqual(len(view_permissions), 1)
        self.assertEqual(view_permissions[0], AllowAny)
