from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from ..validators.FirstAndLastNameValidator import validate_first_name, validate_last_name
from ..validators.password_validator import validate_password


class UserRegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, required=False, validators=[validate_first_name])
    last_name = serializers.CharField(write_only=True, validators=[validate_last_name])
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'username', 'password')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data.get('password'))
        user = User.objects.create(**validated_data)
        return user

    def validate(self, attrs):
        data = super().validate(attrs)
        email = data['email']
        username = data['username']
        if (email is not None and username is not None and email != username):
            raise serializers.ValidationError({"email_username":
                                               "Email and Username should be same"})
        return data
