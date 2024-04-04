from django.test import TransactionTestCase
from api.serializers.MentorSerializer import MentorSerializer
from api.models import Mentor


class InviteeModelTest(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json', 'mentor_data.json']

    def setUp(self):
        self.mentor = Mentor.objects.get(email="kellyapple@example.com")
        self.serializer = MentorSerializer(self.mentor)

    def test_contains_expected_fields(self):
        data = self.serializer.data
        self.assertEqual(set(data.keys()), set(['id', 'first_name', 'last_name', 'email', 'level', 'reliability']))

    def test_data_has_email_for_given_mentor(self):
        data = self.serializer.data
        self.assertEqual(data['email'], 'kellyapple@example.com')

    def test_data_has_level_for_given_mentor(self):
        data = self.serializer.data
        self.assertEqual(data['level'], 'Beginner')

    def test_data_has_reliability_for_given_mentor(self):
        data = self.serializer.data
        self.assertEqual(data['reliability'], 'Unknown')
