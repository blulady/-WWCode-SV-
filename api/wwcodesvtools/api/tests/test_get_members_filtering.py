import json
from django.test import TransactionTestCase
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import date, timedelta
from ..models import User_Team, UserProfile


class GetMembersFilteringTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json']

    def setUp(self):
        self.username = 'director@example.com'
        self.password = 'Password123'
        self.access_token = self.get_token(self.username, self.password)
        self.bearer = {'HTTP_AUTHORIZATION': 'Bearer {}'.format(self.access_token)}

    def get_token(self, username, password):
        s = TokenObtainPairSerializer(data={
            TokenObtainPairSerializer.username_field: self.username,
            'password': self.password,
        })
        self.assertTrue(s.is_valid())
        return s.validated_data['access']

    # Testing get members filtering with status=ACTIVE
    def test_get_members_filtering_with_status(self):
        response = self.client.get("/api/users/?status=ACTIVE", **self.bearer)
        members = json.loads(response.content)
        for member in members:
            self.assertEqual(member['status'], 'ACTIVE')

    # Testing get members filtering with date joined = current_year
    # TODO : Fix time dependent test. Right now the no members are returned in the response
    def test_get_members_filtering_with_date_joined(self):
        response = self.client.get("/api/users/?created_at=current_year", **self.bearer)
        current_year = date.today().year
        members = json.loads(response.content)
        for member in members:
            self.assertEqual(member['date_joined'][:4], str(current_year))

    # Testing get members filtering with date joined = 3 months
    # TODO : Fix time dependent test. Right now the no members are returned in the response
    def test_get_members_filtering_with_date_joined_3months(self):
        response = self.client.get("/api/users/?created_at=3months", **self.bearer)
        three_months = date.today() - timedelta(weeks=12)
        members = json.loads(response.content)
        for member in members:
            self.assertGreaterEqual(member['date_joined'][:10], str(three_months))

    # Testing get members filtering with date joined = 6 months
    # TODO : Fix time dependent test. Right now the no members are returned in the response
    def test_get_members_filtering_with_date_joined_6months(self):
        response = self.client.get("/api/users/?created_at=6months", **self.bearer)
        six_months = date.today() - timedelta(weeks=24)
        members = json.loads(response.content)
        for member in members:
            self.assertGreaterEqual(member['date_joined'][:10], str(six_months))

    # Testing get members filtering with role = LEADER
    def test_get_members_filtering_with_role(self):
        requested_role = 'LEADER'
        response = self.client.get(f"/api/users/?role={requested_role}", **self.bearer)
        members = json.loads(response.content)
        for member in members:
            member_roles_query = User_Team.objects.values('role__name').filter(user_id=member['id'])
            member_roles = [member_role['role__name'] for member_role in member_roles_query]
            self.assertIn(member['highest_role'], member_roles)
            self.assertIn(requested_role, member_roles)

    # Test get members filtering with role = LEADER and status = ACTIVE
    def test_get_members_filtering_with_role_and_status(self):
        requested_role = 'LEADER'
        response = self.client.get(f"/api/users/?role={requested_role}&status={UserProfile.ACTIVE}", **self.bearer)
        members = json.loads(response.content)
        for member in members:
            member_roles_query = User_Team.objects.values('role__name').filter(user_id=member['id'])
            member_roles = [member_role['role__name'] for member_role in member_roles_query]
            self.assertEqual(member['status'], UserProfile.ACTIVE)
            self.assertIn(member['highest_role'], member_roles)
            self.assertIn(requested_role, member_roles)

    # Testing get members filtering with team = 4
    def test_get_members_filtering_with_team(self):
        requested_team = 4
        requested_team_name = 'Partnership Management'
        response = self.client.get(f"/api/users/?team={requested_team}", **self.bearer)
        members = json.loads(response.content)
        for member in members:
            member_teams_query = User_Team.objects.values('team_id', 'team__name').filter(user_id=member['id'])
            member_teams = []
            member_team_names = []
            for member_team in member_teams_query:
                member_team_names.append(member_team['team__name'])
                member_teams.append(member_team['team_id'])
            self.assertIn(requested_team, member_teams)
            self.assertIn(requested_team_name, member_team_names)

    # Testing get members filtering with team = 1 and status = ACTIVE
    def test_get_members_filtering_with_team_status(self):
        requested_team = 1
        requested_team_name = 'Event Volunteers'
        response = self.client.get(f"/api/users/?team={requested_team}", **self.bearer)
        members = json.loads(response.content)
        for member in members:
            member_teams_query = User_Team.objects.values('team_id', 'team__name').filter(user_id=member['id'])
            member_teams = []
            member_team_names = []
            for member_team in member_teams_query:
                member_team_names.append(member_team['team__name'])
                member_teams.append(member_team['team_id'])
            self.assertEqual(member['status'], 'ACTIVE')
            self.assertIn(requested_team, member_teams)
            self.assertIn(requested_team_name, member_team_names)

    # TODO : Write test to unsure PENDING members are not retured in response when the non-director is logged-in
    # logging as a non-director and the output should not have any pending users.
