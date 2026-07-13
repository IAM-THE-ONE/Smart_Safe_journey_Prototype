from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "first_name", "last_name", "phone", "role")

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2", None)
        role = validated_data.get("role", "tourist")
        if role == "admin":
            validated_data.setdefault("is_staff", True)
            validated_data.setdefault("is_superuser", True)
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "phone", "role", "photo", "is_online", "last_latitude", "last_longitude", "email_verified", "date_joined")
        read_only_fields = ("id", "date_joined", "email_verified")


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "photo", "role")


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class FirebaseAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()


class GoogleAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField()
