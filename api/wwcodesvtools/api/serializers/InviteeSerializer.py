from api.models import Invitee
from rest_framework import serializers
from datetime import datetime, timedelta, timezone
from django.conf import settings


class InviteeSerializer(serializers.ModelSerializer):
    role_name = serializers.SerializerMethodField('get_role_name')
    status = serializers.SerializerMethodField('get_status')

    class Meta:
        model = Invitee
        fields = ('email', 'message', 'role', 'role_name', 'status', 'registration_token', 'resent_counter', 'accepted', 'created_at', 'updated_at', 'created_by')

        extra_kwargs = {
            'message': {'write_only': True},
            'role': {'write_only': True},
            'created_by': {'write_only': True},
            'resent_counter': {'write_only': True},
            'registration_token': {'write_only': True},
            'accepted': {'write_only': True},
        }

    """
    Returns the name associated with the role in the invitee
    """
    def get_role_name(self, invitee):
        return invitee.role.name

    """
    Calculate the invitee status:
    INVITED: When the invitee is sent with the registration link for the first time
    EXPIRED: When the registration link is expired (72 hrs after initial registration email was sent or resent)
    RESENT: When director resends registration email/URL, status is changed to resent.
    """
    def get_status(self, invitee):
        INVITED = 'INVITED'
        RESENT = 'RESENT'
        EXPIRED = 'EXPIRED'
        is_expired = self.is_token_expired(invitee.updated_at)
        if(is_expired):
            return EXPIRED
        elif(invitee.resent_counter == 0):
            return INVITED
        elif(invitee.resent_counter > 0):
            return RESENT

    """
    Validate if the token/registration link is expired based on the update date (invitee_update_at)
    It's expired if it's been more than 72hrs
    """
    def is_token_expired(self, invitee_updated_at):
        token_datetime = invitee_updated_at
        now_datetime = datetime.now(timezone.utc)
        return (now_datetime - timedelta(seconds=settings.REGISTRATION_LINK_EXPIRATION) > token_datetime)
