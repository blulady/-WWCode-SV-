from django.test import TransactionTestCase
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from api.models import Mentor
import json


class MentorViewTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'mentor_data.json', 'teams_data.json', 'roles_data.json']
    DIRECTOR_EMAIL = 'director@example.com'
    NO_TECH_TEAM_EMAIL = 'leader@example.com'
    # tech team is the only role allowed to create a mentor
    TECH_TEAM_EMAIL = 'sophiefisher@example.com'
    PASSWORD = 'Password123'

    def setUp(self):
        self.access_token = self.get_token(self.TECH_TEAM_EMAIL, self.PASSWORD)
        self.bearer = {'HTTP_AUTHORIZATION': f'Bearer {self.access_token}'}

    def get_token(self, email, password):
        token_serializer = TokenObtainPairSerializer(data={
            TokenObtainPairSerializer.username_field: email,
            'password': password,
        })
        self.assertTrue(token_serializer.is_valid())
        return token_serializer.validated_data['access']

    def test_get_mentor_info(self):
        response = self.client.get("/api/mentor/", **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_mentor_info_director_not_in_tech_team(self):
        access_token = self.get_token(self.DIRECTOR_EMAIL, self.PASSWORD)
        bearer = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
        response = self.client.get("/api/mentor/", **bearer)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_mentor_info_no_tech_team(self):
        access_token = self.get_token(self.NO_TECH_TEAM_EMAIL, self.PASSWORD)
        bearer = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
        response = self.client.get("/api/mentor/", **bearer)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_all_mentors_ascending(self):
        response = self.client.get("/api/mentor/", **self.bearer)
        response_length = len(response.data)
        response_data = response.data
        first_names = [mentor['first_name'] for mentor in response_data]
        self.assertEqual(response_length, 3)
        self.assertEqual(first_names, sorted(first_names))

    def test_get_all_mentors_descending(self):
        response = self.client.get("/api/mentor/?ordering=-first_name", **self.bearer)
        mentors = response.data
        self.assertEqual(mentors, sorted(mentors, key=lambda x: x['first_name'], reverse=True))

    def test_create_new_mentor(self):
        json_type = "application/json"
        data = json.dumps({'first_name': 'Elena',
                           'last_name': 'Morado',
                           'email': 'elena@example.com',
                           'level': 'Intermediate',
                           'reliability': 'Good'})
        response = self.client.post("/api/mentor/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mentor_created = Mentor.objects.last()
        self.assertEqual(mentor_created.first_name, 'Elena')
        self.assertEqual(mentor_created.last_name, 'Morado')
        self.assertEqual(mentor_created.email, 'elena@example.com')
        self.assertEqual(mentor_created.level, 'Intermediate')
        self.assertEqual(mentor_created.reliability, 'Good')
        self.assertEqual(mentor_created.created_by, mentor_created.updated_by)

    def test_create_mentor_that_already_exists(self):
        json_type = "application/json"
        data = json.dumps({'first_name': 'Raquel',
                           'last_name': 'Nunoz',
                           'email': 'raquelnunoz@email.com',
                           'level': 'Beginner',
                           'reliability': 'Unknown'})
        response = self.client.post("/api/mentor/", data, **self.bearer, accept=json_type, content_type=json_type)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {'error': "{'email': [ErrorDetail(string='mentor with this email already exists.', code='unique')]}"})

    def test_mentor_read_for_tech_team(self):
        response = self.client.get("/api/mentor/1/", **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_mentor_put(self):
        json_type = "application/json"
        data = json.dumps({'id': 1,
                           'first_name': 'Testing',
                           'last_name': 'Alastname',
                           'email': 'anemail@example.com',
                           'level': 'Advanced',
                           'reliability': 'Good'})
        response = self.client.put("/api/mentor/1/", data, **self.bearer, accept=json_type, content_type=json_type)
        mentor = Mentor.objects.get(id=1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mentor.last_name, 'Alastname')
        self.assertEqual(mentor.id, 1)
        self.assertEqual(mentor.email, 'anemail@example.com')
        self.assertEqual(mentor.level, 'Advanced')
        self.assertEqual(mentor.reliability, 'Good')

    def test_delete_mentor(self):
        response = self.client.delete("/api/mentor/1/", **self.bearer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
