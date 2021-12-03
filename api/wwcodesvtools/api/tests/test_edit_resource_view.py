
from django.test import TransactionTestCase
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AND
from api.permissions import CanEditResource
from ..views.EditResourceView import EditResourceView


class EditResourceViewTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ['users_data.json', 'teams_data.json', 'roles_data.json', 'resources_data.json']

    INTERNAL_SERVER_ERROR_EDITING_RESOURCE = 'Something went wrong while editing the Resource'
    RESOURCE_EDITED_SUCCESSFULLY = 'Resource edited successfully'
    SLUG = 'volunteer_resource'

    def setUp(self):
        self.access_token = self.get_token('director@example.com', 'Password123')
        self.bearer = {'HTTP_AUTHORIZATION': 'Bearer {}'.format(self.access_token)}

    def get_token(self, username, password):
        s = TokenObtainPairSerializer(data={
            TokenObtainPairSerializer.username_field: username,
            'password': password,
        })
        self.assertTrue(s.is_valid())
        return s.validated_data['access']

    def post_request(self, slug, data, bearer):
        return self.client.post(f'/api/resources/edit/{slug}', data, **bearer,
                                accept="application/json",
                                content_type="application/json",)

    # test cannot edit an invalid resource slug
    def test_edit_resource_invalid_slug_value(self):
        data = {"edit_link": "", "published_link": ""}
        response = self.post_request('RESOURCE_SLUG', data, self.bearer)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data, {"detail": "Not found."})

    # test edit resource fails for blank input edit_link
    def test_edit_resource_empty_input_edit_link(self):
        data = {"edit_link": "", "published_link": "https://wwww.google.com"}
        response = self.post_request(self.SLUG, data, self.bearer)
        expected_error = 'This field may not be blank.'
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(expected_error, response.data['error'])

    # test edit resource fails for blank published_link input
    def test_edit_resource_empty_input_published_link(self):
        data = {"edit_link": "https://home.com", "published_link": ""}
        response = self.post_request(self.SLUG, data, self.bearer)
        expected_error = 'This field may not be blank.'
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(expected_error, response.data['error'])

    # test edit resource fails for invalid edit_link url
    def test_edit_resource_invalid_url_edit_link(self):
        data = {"edit_link": "https://google/com//document.abcdg", "published_link": "https://www.google.com"}
        response = self.post_request(self.SLUG, data, self.bearer)
        expected_error = 'edit_link is invalid. Enter a valid url'
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(expected_error, response.data['error'])

    # test edit resource fails for invalid url published_link
    def test_edit_resource_invalid_url_published_link(self):
        data = {"edit_link": "https://google.com/document", "published_link": "httpswwwjgkjgjkjgoogle.com"}
        response = self.post_request(self.SLUG, data, self.bearer)
        expected_error = 'published_link is invalid. Enter a valid url'
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(expected_error, response.data['error'])

    # test edit resource is successful with valid link urls
    def test_edit_resource_is_successfull_with_valid_links(self):
        data = {"edit_link": "https://google.com/document", "published_link": "http://www.yahoo.com"}
        response = self.post_request(self.SLUG, data, self.bearer)
        expected_result = 'Resource edited successfully'
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(expected_result, response.data['result'])

    def test_edit_resource_view_permissions(self):
        view_permissions = EditResourceView().permission_classes
        # DRF Permissions OperandHolder Dictionary
        expected_permissions = {'operator_class': AND, 'op1_class': IsAuthenticated, 'op2_class': CanEditResource}
        self.assertEqual(len(view_permissions), 1)
        self.assertDictEqual(view_permissions[0].__dict__, expected_permissions)
