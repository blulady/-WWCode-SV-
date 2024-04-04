from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.utils import datetime_from_epoch
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import User


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            if serializer.is_valid():
                refresh_token = str(serializer.validated_data.get('refresh'))

                # Create an instance of RefreshToken
                r_token = RefreshToken(refresh_token)

                # Add the new refresh token information to the outstanding tokens
                OutstandingToken.objects.get_or_create(
                    user=User.objects.get(pk=r_token['user_id']),
                    jti=r_token['jti'],
                    token=refresh_token,
                    created_at=r_token.current_time,
                    expires_at=datetime_from_epoch(r_token['exp']),
                )
                response_data = serializer.validated_data
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response({'error': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
