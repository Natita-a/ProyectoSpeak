from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Usuarios
from .models import PreferenciasUsuarios
from .models import Practicas
from .models import PracticasHechas
from .models import AspectosEvaluados
from .serializers import PreferenciasUsuariosSerializer
from django.utils import timezone 
from rest_framework.parsers import MultiPartParser
from collections import Counter
import os
import random
import string
import requests
import json
import whisper
import tempfile
import spacy
import ollama




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
                     "id": situacion_elegida.id,
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
        




class GenerarSituacionTemaAleatorio(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
           
            situaciones_varias=Practicas.objects.all()

            if not situaciones_varias.exists():
                return Response({"error":"No hay situaciones registradas."},status=404)
            
            situacion_elegida=random.choice(list(situaciones_varias))

            return Response({
                "tema":situacion_elegida.tema,
                "situacion": {
                     "id": situacion_elegida.id,
                    "titulo": situacion_elegida.situacion,
                    "contexto": situacion_elegida.contexto,
                    "recomendacion": situacion_elegida.recomendacion,
                    "tipo_simulacion": situacion_elegida.tipo_simulacion,
                    "tiempo": situacion_elegida.tiempo,
                }
            })

        except Exception as e:
            import traceback
            print("ERROR DETECTADO:")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)
        



class EscenarioPracticaPropia(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        #Se obtiene user 
        user = request.user

        try:
            usuario_personalizado = Usuarios.objects.get(user=user)
        except Usuarios.DoesNotExist:
            return Response({"error": "Usuario personalizado no encontrado"}, status=404)

        #Se obtiene el id de la practica a iniciar
        simulacion_id = request.data.get('simulacion_id')
        if not simulacion_id:
            return Response({"error": "Falta el ID de la práctica"}, status=400)

     
        try:
            practica = Practicas.objects.get(id=simulacion_id)
            duracion=practica.tiempo
        except Practicas.DoesNotExist:
            return Response({"error": "Práctica no encontrada"}, status=404)

        practica_hecha = PracticasHechas.objects.create(
           # usuario=usuario_personalizado,
            usuario=user,
            simulacion=practica,
            estado='iniciada',
            tiempo_duracion=duracion,
            resultado={},
            fecha=timezone.now()
        )

        return Response({
            "mensaje": "Práctica iniciada correctamente",
            "practica_hecha_id": practica_hecha.id,
        }, status=201)
    



class EscenarioPracticaAleatoria(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        #Se obtiene user 
        user = request.user

        try:
            usuario_personalizado = Usuarios.objects.get(user=user)
        except Usuarios.DoesNotExist:
            return Response({"error": "Usuario personalizado no encontrado"}, status=404)

        #Se obtiene el id de la practica a iniciar
        simulacion_id = request.data.get('simulacion_id')
        if not simulacion_id:
            return Response({"error": "Falta el ID de la práctica"}, status=400)

     
        try:
            practica = Practicas.objects.get(id=simulacion_id)
            duracion=practica.tiempo
        except Practicas.DoesNotExist:
            return Response({"error": "Práctica no encontrada"}, status=404)

        practica_hecha = PracticasHechas.objects.create(
            #usuario=usuario_personalizado,
            usuario=user,
            simulacion=practica,
            estado='iniciada',
            tiempo_duracion=duracion,
            resultado={},
            fecha=timezone.now()
        )

        return Response({
            "mensaje": "Práctica iniciada correctamente",
            "practica_hecha_id": practica_hecha.id,
        }, status=201)
    














                    


class TranscripcionAudioView(APIView):
    parser_classes = [MultiPartParser]
    

    def post(self, request):
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({"error": "No se recibió archivo"}, status=400)

        try:
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                for chunk in audio_file.chunks():
                    tmp.write(chunk)
                temp_path = tmp.name

            model = whisper.load_model("small")
            result = model.transcribe(temp_path)
            texto = result['text']

     
            os.remove(temp_path)

            return Response({"texto": texto})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        



class GuardarTranscripcionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        practica_hecha_id = request.data.get('practica_hecha_id')
        transcripcion = request.data.get('transcripcion')
        duracion_minutos = request.data.get('duracion')

        #Se verifica que la practica existe en la base de datos

        if not practica_hecha_id or transcripcion is None:
            return Response({"error": "Faltan datos requeridos"}, status=400)

        try:
            practica_hecha = PracticasHechas.objects.get(id=practica_hecha_id)
        except PracticasHechas.DoesNotExist:
            return Response({"error": "Práctica hecha no encontrada"}, status=404)

        usuario = practica_hecha.usuario

        #Logica para obtener las palabras por minuto
        palabras = len(transcripcion.split())
        try:
            duracion_minutos = float(duracion_minutos)
            if duracion_minutos <= 0:
                raise ValueError("Duración no válida")
            ppm = int(palabras / duracion_minutos)
        except (ValueError, TypeError):
            ppm = 0

        print(f"Palabras: {palabras}")
        print(f"Duración (minutos): {duracion_minutos}")


        #Analiza la velocidad del discurso
        if ppm > 200:
             velocidad="Hablas demasiado rápido! Deberías reducir tu velocidad."
        elif ppm > 170:
            velocidad="Hablas un poco rápido."
        elif ppm < 100:
            velocidad="Hablas muy lento."
        else:
            velocidad="Buena velocidad."

        #Analiza las muletillas en el discurso

        muletillas_detectadas = detectar_muletillas(transcripcion)


        #Obtiene la coherencia

        coherencia=obtener_coherencia(practica_hecha_id,transcripcion)


         #Obtiene la retroalimentacion

        retroalimentacion = obtener_retroalimentacion(practica_hecha_id,transcripcion)
 
         
        evaluacion = AspectosEvaluados.objects.create(
            usuario=usuario,
            practica_hecha=practica_hecha,
            transcripcion=transcripcion,
            palabras_por_minuto=ppm,
            velocidad=velocidad,
            errores=muletillas_detectadas,
            coherencia=coherencia,
            retroalimentacion=retroalimentacion
                  
        )

        return Response({"mensaje": "Transcripción guardada correctamente", "id": evaluacion.id}, status=201)
    





nlp=spacy.load("es_core_news_sm")

muletillas_comunes={'este','eh','bueno','entonces','pos','pues','mmm','ah','vale','sabes','o','sea','como'}

def detectar_muletillas(texto):
    doc=nlp(texto.lower())
    palabras_repetidas=Counter()
    posibles_muletillas={}

    for token in doc:
        if token.is_punct or token.is_space or len(token.text)<=2:
            continue
        palabras_repetidas[token.text]+=1
        for palabra,frecuencia in palabras_repetidas.items():
            token_filtrado=next((t for t in doc if t.text==palabra),None)
            if frecuencia >2 and(
                palabra in muletillas_comunes or
                (token_filtrado and token_filtrado.pos_ in {"INTJ", "CCONJ", "SCONJ", "PART"})):
            
                posibles_muletillas[palabra] = frecuencia

    return posibles_muletillas

def obtener_coherencia(practica_hecha_id, texto_transcripcion):
    try:
        practica_hecha = PracticasHechas.objects.get(id=practica_hecha_id)
        practica = practica_hecha.simulacion

        situacion = practica.situacion
        contexto = practica.contexto
        recomendacion=practica.recomendacion

        prompt_llama = f"""
Eres un evaluador experto en comunicación oral.

A continuación se presenta una situación , un  contexto, y una recomendacion de un discurso para evaluar:

Situación: {situacion}
Contexto: {contexto}
Recomendacion:{recomendacion}
Texto: {texto_transcripcion}

Evalúa el discurso en relacion a la situacion, el contexto y la recomendacion.Luego, evalúa la coherencia estructural (conexión lógica, fluidez).Esta evaluacion debe estar resumida en 50 palabras en su conjunto

No intentes justificar contenido irrelevante inventando conexiones que no existen.
"""

        response = requests.post(
            "http://localhost:11434/api/generate",  # Puerto y endpoint local de Ollama
            json={
                "model": "llama3.2",
                "prompt": prompt_llama,
                "stream": False
            }
        )

        resp_json = response.json()
        if "response" in resp_json:
            return resp_json["response"]
        else:
            return f"Error: respuesta inesperada {resp_json}"

    except PracticasHechas.DoesNotExist:
        return "No se encontró la práctica hecha"
    except requests.exceptions.RequestException as e:
        return f"Error en la conexión con Ollama: {e}"




        
def obtener_retroalimentacion(practica_hecha_id,texto_transcripcion):
    try:
        practica_hecha=PracticasHechas.objects.get(id=practica_hecha_id)
        practica=practica_hecha.simulacion

        situacion=practica.situacion
        contexto=practica.contexto
        recomendacion=practica.recomendacion

        prompt_llama = f"""
Eres un coach que da retroalimentación para mejorar la fluidez al hablar, detectando velocidad, pausas y muletillas.Evalúa este texto y dame 2 consejos claros para mejorar.

A continuación se presenta una situación , un  contexto, y una recomendacion de un discurso para evaluar:

Situación: {situacion}
Contexto: {contexto}
Recomendacion:{recomendacion}
Texto: {texto_transcripcion}

"""

        response = requests.post(
            "http://localhost:11434/api/generate",  
            json={
                "model": "llama3.2",
                "prompt": prompt_llama,
                "stream": False
            }
        )

        resp_json = response.json()
        if "response" in resp_json:
            return resp_json["response"]
        else:
            return f"Error: respuesta inesperada {resp_json}"
    
    except PracticasHechas.DoesNotExist:
        return "No se encontró la práctica hecha"
    except requests.exceptions.RequestException as e:
        return f"Error en la conexión con Ollama: {e}"
    







class GenerarSituacionModoDebate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:

            # Busca prácticas que coincidan con ese tema
            situaciones = Practicas.objects.filter(tipo_simulacion="modo_debate")

            if not situaciones.exists():
                return Response({"error": f"No hay situaciones registradas para el tema '{tema_elegido}'."}, status=404)

            # Elige una situación aleatoria del tema
            situacion_elegida = random.choice(list(situaciones))

            return Response({
                "tema": situacion_elegida.tema,
                "situacion": {
                     "id": situacion_elegida.id,
                    "titulo": situacion_elegida.situacion,
                    "contexto": situacion_elegida.contexto,
                    "recomendacion": situacion_elegida.recomendacion,
                    "tipo_simulacion": situacion_elegida.tipo_simulacion,
                    "tiempo": situacion_elegida.tiempo,
                }
            })

        except PreferenciasUsuarios.DoesNotExist:
            return Response({"error": "No se encontraron simulacion en modo debate."}, status=404)

        except Exception as e:
            import traceback
            print("ERROR DETECTADO:")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)
        



        
class GenerarSituacionModoExposicion(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:

            # Busca prácticas que coincidan con ese tema
            situaciones = Practicas.objects.filter(tipo_simulacion="modo_exposicion")

            if not situaciones.exists():
                return Response({"error": f"No hay situaciones registradas para el tema '{tema_elegido}'."}, status=404)

            # Elige una situación aleatoria del tema
            situacion_elegida = random.choice(list(situaciones))

            return Response({
                "tema": situacion_elegida.tema,
                "situacion": {
                     "id": situacion_elegida.id,
                    "titulo": situacion_elegida.situacion,
                    "contexto": situacion_elegida.contexto,
                    "recomendacion": situacion_elegida.recomendacion,
                    "tipo_simulacion": situacion_elegida.tipo_simulacion,
                    "tiempo": situacion_elegida.tiempo,
                }
            })

        except PreferenciasUsuarios.DoesNotExist:
            return Response({"error": "No se encontraron simulacion en modo exposicion."}, status=404)

        except Exception as e:
            import traceback
            print("ERROR DETECTADO:")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)
