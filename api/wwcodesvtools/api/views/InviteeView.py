import logging
from api.helper_functions import send_email_helper, is_user_active, generate_registration_token
from api.models import Invitee
from api.permissions import CanAccessInvitee
from api.serializers.InviteeSerializer import InviteeSerializer
from datetime import timedelta
from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import F, fields, Case, When, Value, CharField, Q
from django.db.models.functions import Cast
from django.forms import ValidationError
from django.utils import timezone
from django.utils.http import urlencode
from django.shortcuts import get_object_or_404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema, no_body
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


logger = logging.getLogger('django')


class InviteeViewSet(viewsets.ModelViewSet):

    """
    Returns a list of all invitees.
    Ordering by default is descending by the most recent date of invited member
    ------------------------------------------------
    You may also order by email, status and role_name
    You may also specify reverse orderings by prefixing the field name with '-', like so:
    http//example.com/api/invitee/?ordering=email
    http//example.com/api/invitee/?ordering=-email
    http//example.com/api/invitee/?ordering=status,role_name
    http//example.com/api/invitee/?ordering=-role_name, email

    Returns a list of invitees.
    -------------------------------------------------------------
    Search by any number of characters in email:
    http//example.com/api/users/?search=email
    Returns a list of invitees

    Returns a list of invitees.
    -------------------------------------------------------------
    Search and ordering:
    http//example.com/api/users/?ordering=role_name&search=email
    Returns a list of invitees
    """

    permission_classes = [IsAuthenticated & CanAccessInvitee]
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ['email', 'status', 'role_name']
    search_fields = ['^email']
    queryset = Invitee.objects.all()
    serializer_class = InviteeSerializer

    # Validates if the fields passed as parameters for ordering are allowed
    def validate_ordering_fields(self, fields):
        allowed_fields = self.ordering_fields
        invalid_fields = [field for field in fields if field.lstrip('-') not in allowed_fields]
        if invalid_fields:
            error_message = f"The following ordering fields are invalid: {', '.join(invalid_fields)}"
            raise ValidationError(error_message)

    # Override get_queryset for custom implementation of ordering and search
    def get_queryset(self):
        threshold_datetime = timezone.now() - timedelta(seconds=settings.REGISTRATION_LINK_EXPIRATION)

        # Annotate queryset to dynamically compute role_name and status fields
        # in order to be able to use them as ordering fields
        queryset = Invitee.objects.annotate(role_name=Cast(F('role__name'), CharField()),
                                            status=Case(
                                                When(~Q(updated_at__lt=threshold_datetime) & Q(resent_counter=0), then=Value('INVITED')),
                                                When(~Q(updated_at__lt=threshold_datetime) & Q(resent_counter__gt=0), then=Value('RESENT')),
                                                When(updated_at__lt=threshold_datetime, then=Value('EXPIRED')),
                                                output_field=fields.CharField()
                                            ))
        search_query = self.request.query_params.get('search')
        if search_query is not None:
            queryset = queryset.filter(email__istartswith=search_query)
        ordering_fields = self.request.query_params.get('ordering')
        if ordering_fields:
            ordering_fields = ordering_fields.split(',')
            self.validate_ordering_fields(ordering_fields)
            ordering_fields.append('-updated_at')
            return queryset.order_by(*ordering_fields)
        return queryset.order_by(('-updated_at'))

    get_response_schema = {
        status.HTTP_200_OK: openapi.Response(
            description="List of all Invitees",
            examples={
                "application/json": {
                    'result': [
                                {
                                    "id": 7,
                                    "email": "volunteer_7@example.com",
                                    "role_name": "DIRECTOR",
                                    "status": "RESENT",
                                    "created_at": "2023-09-26T02:00:33.552925Z",
                                    "updated_at": "2023-09-26T02:00:33.552925Z"
                                },
                                {
                                    "id": 9,
                                    "email": "volunteer_9@example.com",
                                    "role_name": "DIRECTOR",
                                    "status": "INVITED",
                                    "created_at": "2023-09-25T23:22:01.413300Z",
                                    "updated_at": "2023-09-25T23:22:01.413333Z"
                                },
                                {
                                    "id": 3,
                                    "email": "volunteer_3@example.com",
                                    "role_name": "LEADER",
                                    "status": "EXPIRED",
                                    "created_at": "2017-10-19T17:30:10.468000Z",
                                    "updated_at": "2017-10-19T17:30:10.468000Z"
                                },
                        ]
                }
            }
        ),
        status.HTTP_400_BAD_REQUEST: openapi.Response(
            description="User is not authenticated",
            examples={
                "application/json": {
                    "error": "The following ordering fields are invalid: invalid_field",
                }
            }
        ),
        status.HTTP_401_UNAUTHORIZED: openapi.Response(
            description="User is not authenticated",
            examples={
                "application/json": {
                    "detail": "Authentication credentials were not provided.",
                }
            }
        ),
        status.HTTP_403_FORBIDDEN: openapi.Response(
            description="User is not allowed",
            examples={
                "application/json": {
                    "detail": "You do not have permission to perform this action.",
                }
            }
        ),
    }

    @swagger_auto_schema(
        operation_summary="Lists all Invitees sorted descending by the most recent date of invited member",
        responses=get_response_schema)
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer_class()(queryset, many=True)
        except ValidationError as error:
            return Response({'error': str(error)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as error:
            return Response({'error': str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.data)

    ERROR_CREATING_INVITEE = 'Error creating invitee'
    ERROR_SENDING_EMAIL_NOTIFICATION = 'Error sending email notification to the invitee'
    ERROR_RESENDING_REGISTRATION_INVITATION = 'Something went wrong during resend to invitee'
    INVITEE_CREATED_SUCCESSFULLY = 'Invitee Created Succesfully'
    INVITEE_DELETED_SUCCESSFULLY = 'Invitee Deleted Succesfully'
    INVITEE_NOT_FOUND = 'Invitee not found in database'
    INVITEE_RESEND_SUCCESSFUL = 'Resend registration invitation successful'
    INVITEE_NOT_FOUND = 'Requested id not found in Invitee database'
    USER_ALREADY_ACTIVE_MESSAGE = 'There is already an active user associated with this email'

    post_response_schema = {
        status.HTTP_200_OK: openapi.Response(
            description="Invitee created and email sent successfully",
            examples={
                "application/json": {
                    'result': INVITEE_CREATED_SUCCESSFULLY,
                    'token': "0148f55a1f404363bf27dd8ebc9443c920210210220436"
                }
            }
        ),
        status.HTTP_400_BAD_REQUEST: openapi.Response(
            description="Bad Request",
            examples={
                "application/json": {
                    'error': {
                        "email": ["Enter a valid email address."],
                        "role": ["Invalid pk \"n\" - object does not exist."]
                    }
                }
            }
        ),
        status.HTTP_500_INTERNAL_SERVER_ERROR: openapi.Response(
            description="Internal Server Error",
            examples={
                "application/json": {
                     'error': ERROR_CREATING_INVITEE
                }
            }
        ),
        status.HTTP_502_BAD_GATEWAY: openapi.Response(
            description="Bad Gateway",
            examples={
                "application/json": {
                    'error': ERROR_SENDING_EMAIL_NOTIFICATION
                }
            }
        ),
    }

    @swagger_auto_schema(request_body=openapi.Schema(
                             type=openapi.TYPE_OBJECT,
                             properties={
                                'email': openapi.Parameter('email', openapi.IN_BODY, description="Email", type=openapi.TYPE_STRING),
                                'role': openapi.Parameter('role', openapi.IN_BODY, description="Role", type=openapi.TYPE_INTEGER),
                                'message': openapi.Parameter('message', openapi.IN_BODY, description="Message", type=openapi.TYPE_STRING)
                             },
                         ),
                         operation_description="POST /invitee/",
                         responses=post_response_schema)
    @transaction.atomic
    def create(self, request):
        res_status = None
        error = None
        req = request.data
        logger.debug(f'InviteeViewSet Create : query params: {req}')

        try:
            email = req.get('email').lower()
            role = req.get('role')
            message = req.get('message')

            # validate if a user with the given email exists in the system
            if (is_user_active(email)):
                return Response({'error': self.USER_ALREADY_ACTIVE_MESSAGE}, status=status.HTTP_400_BAD_REQUEST)
            else:
                registration_token = generate_registration_token()
                created_by = request.user.id
                logger.debug(f'InviteeViewSet Create: token ={registration_token} : created_by ={created_by}')

                invitee_data = {
                    "email": email,
                    "message": message,
                    "role": role,
                    "status": 'INVITED',
                    "registration_token": registration_token,
                    "resent_counter": 0,
                    'created_by': created_by
                }

                # create invitee in the invitee table
                serializer_invitee = InviteeSerializer(data=invitee_data)
                if serializer_invitee.is_valid():
                    # creating txn savepoint
                    sid = transaction.savepoint()
                    serializer_invitee.save()
                    logger.info('InviteeViewSet Create: Invitee data valid')
                    # If invitee created successfully, then send email notification to the new invitee
                    message_sent = self.send_email_notification(email, registration_token, message)
                    if message_sent:
                        # all well, commit data to the db
                        transaction.savepoint_commit(sid)
                        res_status = status.HTTP_200_OK
                        logger.info('InviteeViewSet Create : Invitee created and email sent successfully')
                    else:
                        # something went wrong sending the email, don't commit data to db, rollback txn
                        transaction.savepoint_rollback(sid)
                        res_status = status.HTTP_502_BAD_GATEWAY
                        error = self.ERROR_SENDING_EMAIL_NOTIFICATION
                        logger.info('InviteeViewSet Create : email NOT sent, invitee rolled back')
                else:
                    # invalid data
                    error = serializer_invitee.errors
                    res_status = status.HTTP_400_BAD_REQUEST
        except Exception as e:
            error = self.ERROR_CREATING_INVITEE
            logger.error(f'InviteeViewSet Create: {error}: {e}')
            res_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        if (error is None and res_status == status.HTTP_200_OK):
            return Response({'result': self.INVITEE_CREATED_SUCCESSFULLY, 'token': registration_token}, status=res_status)
        return Response({'error': str(error)}, status=res_status)

    def send_email_notification(self, email, token, message):
        registration_link = f'{settings.FRONTEND_APP_URL}/register?{urlencode({"email": email, "token": token})}'
        logger.debug(f'InviteeViewSet Create: registration link {registration_link}')
        context_data = {"user": email,
                        "registration_link": registration_link,
                        "optional_message": message
                        }
        return send_email_helper(
            email, 'Invitation to Join Chapter Portal, Action Required', 'new_member_email.html', context_data)

    post_resend_schema = {
        status.HTTP_200_OK: openapi.Response(
            description="Registration Invitation resent successfully",
            examples={
                "application/json": {
                    'result': INVITEE_RESEND_SUCCESSFUL,
                    'token': "0148f55a1f404363bf27dd8ebc9443c920210210220436"
                }
            }
        ),
        status.HTTP_404_NOT_FOUND: openapi.Response(
            description="Id not found in Invitee database",
            examples={
                "application/json": {
                    'result': INVITEE_NOT_FOUND,
                    'token': "0148f55a1f404363bf27dd8ebc9443c920210210220436"
                }
            }
        ),
        status.HTTP_500_INTERNAL_SERVER_ERROR: openapi.Response(
            description="Error resending registration invitation",
            examples={
                "application/json": {
                    'result': INVITEE_NOT_FOUND,
                    'token': "0148f55a1f404363bf27dd8ebc9443c920210210220436"
                }
            }
        ),
    }

    @swagger_auto_schema(request_body=no_body, responses=post_resend_schema)
    @action(methods=['patch'], detail=True)
    def resend(self, request, *args, **kwargs):
        error = None
        invitee_id = kwargs.get('pk')
        target_invitee = get_object_or_404(Invitee, pk=invitee_id)
        logger.debug("invitee exists or 404", target_invitee)
        requestor = User.objects.get(email=request.user.email)

        try:
            message = "Resending registration invitation"
            target_invitee.created_by = requestor
            target_invitee.resent_counter += 1
            target_invitee.registration_token = generate_registration_token()
            message_sent = self.send_email_notification(target_invitee.email, target_invitee.registration_token, message)
            if message_sent:
                target_invitee.save()
                logger.info('InviteeViewSet Resend: Invitee registration invitation resent successfully')
                res_status = status.HTTP_200_OK
            else:
                res_status = status.HTTP_500_INTERNAL_SERVER_ERROR
                error = self.ERROR_RESENDING_REGISTRATION_INVITATION
        except Exception as e:
            error = e
            logger.error(f'InviteeViewSet Resend: error: {e}')
            res_status = status.HTTP_500_INTERNAL_SERVER_ERROR

        if error is None and res_status == status.HTTP_200_OK:
            return Response({'result': self.INVITEE_RESEND_SUCCESSFUL}, status=res_status)
        return Response({'Error': str(error)}, status=res_status)

    post_delete_schema = {
        status.HTTP_200_OK: openapi.Response(
            description="Invitee deleted successfully",
            examples={
                "application/json": {
                    'result': INVITEE_DELETED_SUCCESSFULLY,
                    'token': "0148f55a1f404363bf27dd8ebc9443c920210210220436"
                }
            }
        ),
        status.HTTP_404_NOT_FOUND: openapi.Response(
            description="Invitee not found in database",
        ),
        status.HTTP_500_INTERNAL_SERVER_ERROR: openapi.Response(
            description="Internal Server Error",
            examples={
                "application/json": {
                    'result': 'Internal server error.',
                    'token': "0148f55a1f404363bf27dd8ebc9443c920210210220436"
                }
            }
        ),
    }

    @swagger_auto_schema(responses=post_delete_schema)
    def destroy(self, request, *args, **kwargs):
        error = None
        try:
            invitee_obj = self.get_object()
            invitee_obj.delete()
            res_status = status.HTTP_200_OK
        except Exception as e:
            error = "Delete invitee failed. Invitee not found in database."
            logger.error(f'InviteeViewSet Destroy: {error}: {e}')
            res_status = status.HTTP_404_NOT_FOUND

        if (error is None):
            return Response({'Result': 'Invitee deleted successfully'}, status=res_status)
        else:
            return Response({'Result': str(error)}, status=res_status)
