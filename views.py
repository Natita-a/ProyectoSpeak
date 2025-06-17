from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Usuarios
import random
import string

class RegistroUsuario(APIView):
    def post(self, request):

        correo = request.data.get('email')
        contrasena = request.data.get('password')

        if not correo or not contrasena:
            return Response({'error': 'Faltan datos'}, status=status.HTTP_400_BAD_REQUEST)


        if User.objects.filter(username=correo).exists():
            return Response({'error': 'Correo ya registrado'}, status=status.HTTP_400_BAD_REQUEST)

    
        user = User.objects.create_user(username=correo, email=correo, password=contrasena)


        codigo_verificacion = ''.join(random.choices(string.digits, k=6))


        perfil = Usuarios.objects.create(
            user=user,
            verificado=False,
            codigo_verificacion=codigo_verificacion
        )


        return Response(
            {'mensaje': 'Usuario registrado con éxito', 'codigo_verificacion': codigo_verificacion},
            status=status.HTTP_201_CREATED
        )
