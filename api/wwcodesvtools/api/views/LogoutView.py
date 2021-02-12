from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from api.serializers import LogoutSerializer
import logging


logger = logging.getLogger('django')


class LogoutView(GenericAPIView):
    """
    Logs out the  user from all devices
    - adds the refresh tokens belonging to the user to the black list.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    post_response_schema = {
        status.HTTP_205_RESET_CONTENT: openapi.Response(
            description="User Logged Out",
            examples={
                "application/json": {}
            }
        ),
        status.HTTP_400_BAD_REQUEST: openapi.Response(
            description="Bad Request",
            examples={
                "application/json": {
                    'error': 'Error Logging out'
                }
            }
        ),
    }

    @swagger_auto_schema(responses=post_response_schema)
    def post(self, request):
        try:
            tokens = OutstandingToken.objects.filter(user_id=request.user.id)
            for token in tokens:
                t, _ = BlacklistedToken.objects.get_or_create(token=token)
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            logger.error(f'LogoutView:Error logging out  : {e}')
            return Response({'error': 'Error Logging out'}, status=status.HTTP_400_BAD_REQUEST)
