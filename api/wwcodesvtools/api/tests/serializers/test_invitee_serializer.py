from datetime import datetime, timedelta
from django.test import TransactionTestCase
from api.serializers.InviteeSerializer import InviteeSerializer
from api.helper_functions import generate_registration_token
from api.models import Invitee
from django.conf import settings


class InviteeModelTest(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json', 'invitee.json']
    reg_token = generate_registration_token()

    def setUp(self):
        self.invitee = Invitee.objects.get(id=2)
        self.serializer = InviteeSerializer(self.invitee)

    def test_contains_expected_fields(self):
        data = self.serializer.data
        self.assertEqual(set(data.keys()), set(['id', 'email', 'role_name', 'status', 'created_at', 'updated_at']))

    def test_data_has_email_for_given_invitee(self):
        data = self.serializer.data
        self.assertEqual(data['email'], 'sophiefisher@example.com')

    def test_data_has_role_name_for_given_invitee(self):
        data = self.serializer.data
        self.assertEqual(data['role_name'], 'VOLUNTEER')

    def test_data_has_status_for_given_invitee(self):
        data = self.serializer.data
        self.assertEqual(data['status'], 'EXPIRED')

    '''
    Invited status: resent_counter must be 0 and
    token should be valid (datetime < 72hrs)
    '''
    def test_invited_status_for_invitee(self):
        invitee_serializer = InviteeSerializer(data={
            "email":  "test_invited@example.com",
            "role": 1,
            "registration_token": self.reg_token,
            "resent_counter": 0,
            "created_by": 1
        })
        self.assertTrue(invitee_serializer.is_valid())
        invitee_serializer.save()
        self.assertEqual(invitee_serializer.data['status'], 'INVITED')

    '''
    Expired status: the token should be invalid (datetime >= 72hrs)
    '''
    def test_expired_status_for_invitee(self):
        three_days_ago_time = (datetime.now() - timedelta(seconds=settings.REGISTRATION_LINK_EXPIRATION)).strftime('%Y%m%d%H%M%S')
        token = f"abcdefa0342a4330bc790f23ac70a7b6{three_days_ago_time}"
        invitee_serializer = InviteeSerializer(data={
            "email":  "test_expired@example.com",
            "role": 1,
            "registration_token": token,
            "resent_counter": 0,
            "created_by": 1
        })
        self.assertTrue(invitee_serializer.is_valid())
        invitee_serializer.save()
        self.assertEqual(invitee_serializer.data['status'], 'EXPIRED')

    '''
    Resent status: The invitee has been sent more than once (resent_counter >0)
    and the token should be valid (datetime < 72hrs)
    '''
    def test_resent_status_for_invitee(self):
        invitee_serializer = InviteeSerializer(data={
            "email":  "test_resent@example.com",
            "role": 1,
            "registration_token": self.reg_token,
            "resent_counter": 1,
            "created_by": 1
        })
        self.assertTrue(invitee_serializer.is_valid())
        invitee_serializer.save()
        self.assertEqual(invitee_serializer.data['status'], 'RESENT')

    '''
    Expired status after Resent status: The invitee has been sent more than once (resent_counter >0)
    and the token should be invalid (datetime >= 72hrs)
    '''
    def test_expired_status_after_resent_status_for_invitee(self):
        three_days_ago_time = (datetime.now() - timedelta(seconds=settings.REGISTRATION_LINK_EXPIRATION)).strftime('%Y%m%d%H%M%S')
        token = f"abcdefa0342a4330bc790f23ac70a7b6{three_days_ago_time}"
        invitee_serializer = InviteeSerializer(data={
            "email":  "test_resent@example.com",
            "role": 1,
            "registration_token": token,
            "resent_counter": 1,
            "created_by": 1
        })
        self.assertTrue(invitee_serializer.is_valid())
        invitee_serializer.save()
        self.assertEqual(invitee_serializer.data['status'], 'EXPIRED')
