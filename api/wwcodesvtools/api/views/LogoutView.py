from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework.views import APIView
import logging


logger = logging.getLogger('django')


class LogoutView(APIView):
    """
    Logs out the current user from all sessions
    - adds the refresh tokens belonging to the user to the black list.
    """
    permission_classes = [IsAuthenticated]

    post_response_schema = {
        status.HTTP_205_RESET_CONTENT: openapi.Response(
            description="User Logged Out",
            examples={
                "application/json": {}
            }
        ),
        status.HTTP_500_INTERNAL_SERVER_ERROR: openapi.Response(
            description="Internal Server Error",
            examples={
                "application/json": {
                    'error': 'Error Logging out'
                }
            }
        ),
    }

    @swagger_auto_schema(operation_description="Logout current user from all devices adding all refresh tokens belonging to the user to the black list",
                         operation_summary="Logout current user from all devices",
                         responses=post_response_schema)
    def post(self, request):
        try:
            tokens = OutstandingToken.objects.filter(user_id=request.user.id)
            for token in tokens:
                t, _ = BlacklistedToken.objects.get_or_create(token=token)
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            logger.error(f'LogoutView:Error logging out  : {e}')
            return Response({'error': 'Error Logging out'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
