from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from api.permissions import CanAccessMentor
from api.models import Mentor
from api.serializers.MentorSerializer import MentorSerializer
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
import logging
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404

logger = logging.getLogger('django')


class MentorView(viewsets.ModelViewSet):
    queryset = Mentor.objects.all()
    serializer_class = MentorSerializer
    permission_classes = [IsAuthenticated & CanAccessMentor]
    filter_backends = [OrderingFilter]
    ordering_fields = ['first_name']
    ordering = ['first_name']
    http_method_names = ['get', 'post', 'put', 'delete']

    ERROR_MENTOR_NOT_FOUND = 'Mentor does not exist.'
    ERROR_CREATING_MENTOR = 'Error creating Mentor.'
    ERROR_UPDATING_MENTOR = 'Error updating Mentor.'
    ERROR_DELETING_MENTOR = 'Error deleting Mentor.'
    MENTOR_CREATED_SUCCESSFULLY = 'Mentor Created Successfully.'
    MENTOR_UPDATED_SUCCESSFULLY = 'Mentor Updated Successfully.'
    MENTOR_DELETED_SUCCESSFULLY = 'Mentor Deleted Successfully.'

    get_response_schema = {
        status.HTTP_200_OK: openapi.Response(
            description="List of all Mentors",
            examples={
                "application/json": {
                    'result': [

                            {"id": 2,
                             "first_name": "Kelly",
                             "last_name": "Apple",
                             "email": "kellyapple@example.com",
                             "level": "Beginner",
                             "reliability": "Unknown"},

                            {"id": 1,
                             "first_name": "Raquel",
                             "last_name": "Nunoz",
                             "email": "raquelnunoz@email.com",
                             "level": "Beginner",
                             "reliability": "Unknown"}

                        ]
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
        operation_summary="Get a list of all Mentors",
        responses=get_response_schema)
    def list(self, request):
        queryset = self.get_queryset()
        queryset = queryset.distinct()
        filter_query_set = self.filter_queryset(queryset)
        serializer = self.get_serializer_class()(filter_query_set, many=True)
        return Response(serializer.data)

    get_id_response_schema = {
        status.HTTP_200_OK: openapi.Response(
            description="Details of a specific Mentor",
            examples={
                "application/json": {
                    'result':
                        {"id": 1,
                         "first_name": "Raquel",
                         "last_name": "Nunoz",
                         "email": "raquelnunoz@email.com",
                         "level": "Beginner",
                         "reliability": "Unknown"}
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
        status.HTTP_404_NOT_FOUND: openapi.Response(
            description="Mentor does not exist",
            examples={
                "application/json": {
                    "detail": "Not found.",
                }
            }
        )
    }

    @swagger_auto_schema(
        operation_summary="Get a specific Mentor",
        responses=get_id_response_schema)
    def retrieve(self, request, pk):
        instance = self.get_object()
        # serializer = self.get_serializer(instance)
        serializer = self.get_serializer_class()(instance)
        return Response(serializer.data)

    post_response_schema = {
        status.HTTP_200_OK: openapi.Response(
            description=MENTOR_CREATED_SUCCESSFULLY,
            examples={
                "application/json": {
                    "result": MENTOR_CREATED_SUCCESSFULLY
                }
            }
        ),
        status.HTTP_400_BAD_REQUEST: openapi.Response(
            description=ERROR_CREATING_MENTOR,
            examples={
                "application/json": {
                    "error": {
                        "email": ["mentor with this email already exists", "This field is required."],
                    }
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
        status.HTTP_500_INTERNAL_SERVER_ERROR: openapi.Response(
            description=ERROR_CREATING_MENTOR,
            examples={
                "application/json": {
                    "error": ERROR_CREATING_MENTOR
                    }
                }
            )
        }

    @swagger_auto_schema(request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "first_name": openapi.Parameter("first_name", openapi.IN_BODY, description="first_name", type=openapi.TYPE_STRING),
            "last_name": openapi.Parameter("last_name", openapi.IN_BODY, description="last_name", type=openapi.TYPE_STRING),
            "email": openapi.Parameter("email", openapi.IN_BODY, description="email", type=openapi.TYPE_STRING),
            "level": openapi.Parameter("level", openapi.IN_BODY, description="level", type=openapi.TYPE_STRING),
            "reliability": openapi.Parameter("reliability", openapi.IN_BODY, description="reliability", type=openapi.TYPE_STRING)
            },
        ),
        operation_summary="Creates a new Mentor",
        responses=post_response_schema)
    def create(self, request):
        res_status = None
        error = None
        data = request.data
        user = request.user
        email = data.get('email').lower()
        try:
            mentor_data = {
                "email": email,
                "first_name": data.get("first_name"),
                "last_name": data.get("last_name"),
                "level": data.get("level"),
                "reliability": data.get("reliability"),
                "created_by": user.id,
                "updated_by": user.id
            }
            serializer_mentor = MentorSerializer(data=mentor_data)
            if serializer_mentor.is_valid():
                try:
                    serializer_mentor.save()
                    res_status = status.HTTP_200_OK
                except Exception as e:
                    error = e
                    res_status = status.HTTP_400_BAD_REQUEST
            else:
                error = serializer_mentor.errors
                res_status = status.HTTP_400_BAD_REQUEST
        except Exception as e:
            error = self.ERROR_CREATING_MENTOR
            logger.error(f'MentorViewSet Create: {error}: {e}')
            res_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        if (error is None and res_status == status.HTTP_200_OK):
            return Response({'result': self.MENTOR_CREATED_SUCCESSFULLY}, status=res_status)
        return Response({'error': str(error)}, status=res_status)

    update_response_schema = {
        status.HTTP_200_OK: openapi.Response(
            description=MENTOR_UPDATED_SUCCESSFULLY,
            examples={
                "application/json": {
                    "result": MENTOR_UPDATED_SUCCESSFULLY
                }
            }
        ),
        status.HTTP_400_BAD_REQUEST: openapi.Response(
            description=ERROR_UPDATING_MENTOR,
            examples={
                "application/json": {
                    "error": {
                        "email": ["mentor with this email already exists", "This field is required."],
                    }
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
        status.HTTP_404_NOT_FOUND: openapi.Response(
            description=ERROR_MENTOR_NOT_FOUND,
            examples={
                "application/json": {
                    "detail": "Not found."
                }
            }
        ),
        status.HTTP_500_INTERNAL_SERVER_ERROR: openapi.Response(
            description=ERROR_UPDATING_MENTOR,
            examples={
                "application/json": {
                    "error": ERROR_UPDATING_MENTOR
                }
            }
        )
    }

    @swagger_auto_schema(request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "first_name": openapi.Parameter("first_name", openapi.IN_BODY, description="first_name", type=openapi.TYPE_STRING),
            "last_name": openapi.Parameter("last_name", openapi.IN_BODY, description="last_name", type=openapi.TYPE_STRING),
            "email": openapi.Parameter("email", openapi.IN_BODY, description="email", type=openapi.TYPE_STRING),
            "level": openapi.Parameter("level", openapi.IN_BODY, description="level", type=openapi.TYPE_STRING),
            "reliability": openapi.Parameter("reliability", openapi.IN_BODY, description="reliability", type=openapi.TYPE_STRING)
        }
    ),
        operation_summary="Updates a specific Mentor",
        responses=update_response_schema)
    def update(self, request, *args, **kwargs):
        error = None
        res_status = None
        data = request.data
        user = request.user
        mentor_target = self.get_object()
        email = data.get('email').lower()
        if mentor_target:
            try:
                mentor_data = {
                    "email": email,
                    "first_name": data.get("first_name"),
                    "last_name": data.get("last_name"),
                    "level": data.get("level"),
                    "reliability": data.get("reliability"),
                    "updated_by": user.id
                }
                serializer_mentor = MentorSerializer(instance=mentor_target, data=mentor_data)
                if serializer_mentor.is_valid():
                    try:
                        serializer_mentor.save()
                        res_status = status.HTTP_200_OK
                    except Exception as e:
                        error = e
                        res_status = status.HTTP_400_BAD_REQUEST
                else:
                    error = serializer_mentor.errors
                    res_status = status.HTTP_400_BAD_REQUEST
            except Exception as e:
                error = self.ERROR_UPDATING_MENTOR
                logger.error(f'MentorViewSet Update: {error}: {e}')
                res_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        else:
            error = self.ERROR_MENTOR_NOT_FOUND
            res_status = status.HTTP_404_NOT_FOUND
        if (error is None and res_status == status.HTTP_200_OK):
            return Response({'result': self.MENTOR_UPDATED_SUCCESSFULLY}, status=res_status)
        return Response({'error': str(error)}, status=res_status)

    delete_response_schema = {
        status.HTTP_200_OK: openapi.Response(
            description=MENTOR_DELETED_SUCCESSFULLY,
            examples={
                "application/json": {
                    "result": MENTOR_DELETED_SUCCESSFULLY
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
        status.HTTP_404_NOT_FOUND: openapi.Response(
            description=ERROR_MENTOR_NOT_FOUND,
            examples={
                "application/json": {
                    "detail": ERROR_MENTOR_NOT_FOUND,
                }
            }
        ),
        status.HTTP_500_INTERNAL_SERVER_ERROR: openapi.Response(
            description=ERROR_UPDATING_MENTOR,
            examples={
                "application/json": {
                    "result": "Internal server error"
                }
            }
        )
    }

    @swagger_auto_schema(
        operation_summary="Deletes a specific Mentor",
        responses=delete_response_schema)
    def destroy(self, request, *args, **kwargs):
        try:
            mentor = self.get_object()
            mentor.delete()
            return Response({'result': self.MENTOR_DELETED_SUCCESSFULLY}, status=status.HTTP_200_OK)
        except Http404:
            return Response({'error': self.ERROR_MENTOR_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'error': self.ERROR_DELETING_MENTOR}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
