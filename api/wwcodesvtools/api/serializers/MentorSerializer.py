from api.models import Mentor
from rest_framework import serializers
from ..validators.FirstAndLastNameValidator import validate_first_name, validate_last_name


class MentorSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(validators=[validate_first_name])
    last_name = serializers.CharField(validators=[validate_last_name])

    class Meta:
        model = Mentor
        fields = ('id', 'first_name', 'last_name', 'email', 'level', 'reliability', 'created_by', 'updated_by')

        extra_kwargs = {
            'created_by': {'write_only': True},
            'updated_by': {'write_only': True}
        }
