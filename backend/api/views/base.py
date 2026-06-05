from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from ..serializers import UserSerializer


@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok", "message": "Backend is connected to the Brain!"})


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
