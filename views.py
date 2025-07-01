from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Usuarios
from .models import PreferenciasUsuarios
from .serializers import PreferenciasUsuariosSerializer
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


class GuardarProposito(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        proposito = request.data.get('proposito')
        if not proposito:
            return Response({'error': 'Campo proposito obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        
        preferencias, created = PreferenciasUsuarios.objects.update_or_create(
            usuario=request.user,
            defaults={'proposito': proposito}
        )

        serializer = PreferenciasUsuariosSerializer(preferencias)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class GuardarPreferencia(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        temas_preferencia = request.data.get('temas_preferencia')
        if not temas_preferencia or not isinstance(temas_preferencia, list):
            return Response({'error': 'Campo temas_preferencia obligatorio y debe ser una lista'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(temas_preferencia) != 3:
            return Response({'error': 'Debe seleccionar exactamente 3 temas'}, status=status.HTTP_400_BAD_REQUEST)

        preferencias, created = PreferenciasUsuarios.objects.update_or_create(
            usuario=request.user,
            defaults={'temas_preferencia': temas_preferencia}
        )

        preferencias.refresh_from_db() 

        serializer = PreferenciasUsuariosSerializer(preferencias, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class VerificarPreferencias(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            preferencias = PreferenciasUsuarios.objects.get(usuario=request.user)
            if preferencias.proposito and preferencias.temas_preferencia and len(preferencias.temas_preferencia) == 3:
                return Response({'completo': True})
            else:
                return Response({'completo': False})
        except PreferenciasUsuarios.DoesNotExist:
            return Response({'completo': False})


        perfil = Usuarios.objects.create(
            user=user,
            verificado=False,
            codigo_verificacion=codigo_verificacion
        )


        return Response(
            {'mensaje': 'Usuario registrado con éxito', 'codigo_verificacion': codigo_verificacion},
            status=status.HTTP_201_CREATED
        )



class GenerarSituacionTemaPropio(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Se obtienen las preferencias del usuario
            preferencias = PreferenciasUsuarios.objects.get(usuario=request.user)
            temas = preferencias.temas_preferencia

            if not temas:
                return Response({"error": "No hay temas configurados para este usuario."}, status=400)

            # Elegir un tema aleatorio entre los de preferencia
            tema_elegido = random.choice(temas)

            # Busca prácticas que coincidan con ese tema
            situaciones = Practicas.objects.filter(tema=tema_elegido)

            if not situaciones.exists():
                return Response({"error": f"No hay situaciones registradas para el tema '{tema_elegido}'."}, status=404)

            # Elige una situación aleatoria del tema
            situacion_elegida = random.choice(list(situaciones))

            return Response({
                "tema": tema_elegido,
                "situacion": {
                    "titulo": situacion_elegida.situacion,
                    "contexto": situacion_elegida.contexto,
                    "recomendacion": situacion_elegida.recomendacion,
                    "tipo_simulacion": situacion_elegida.tipo_simulacion,
                    "tiempo": situacion_elegida.tiempo,
                }
            })

        except PreferenciasUsuarios.DoesNotExist:
            return Response({"error": "No se encontraron preferencias para este usuario."}, status=404)

        except Exception as e:
            import traceback
            print("ERROR DETECTADO:")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)
