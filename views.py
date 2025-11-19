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
from .serializers import AspectosEvaluadosSerializer#Nuevo
from .serializers import PracticaHechaSerializer
from django.utils import timezone
from django.db.models import Exists, OuterRef
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
    permission_classes=[IsAuthenticated]


    def get(self,request):
        try:
            #Se ven los temas de preferencia del usuario
            preferencias=PreferenciasUsuarios.objects.get(usuario=request.user)
            temas=preferencias.temas_preferencia

            if not temas:
                return Response({"error":"No hay temas configurados para este usuario."},status=400)
            
            tema_param = request.query_params.get('tema',None)

            if tema_param:
                if tema_param not in temas:
                    return Response({"error": f"El tema '{tema_param}' no esta entre tus temas preferidos."},status=400)
                tema_elegido=tema_param
            else:
                #Apartir del tema elegido se  busca una escena aleatoria
                tema_elegido=random.choice(temas)

            situaciones=Practicas.objects.filter(tema=tema_elegido)

            if not situaciones.exists():
                #Este mensaje se muestra cuando no existe una situacion en la base de datos para el tema
                return Response({"error":f"No hay situaciones registradas para el tema '{tema_elegido}'."},status=404)
            
            #Se muestra la situacion a simular
            situacion_elegida=random.choice(list(situaciones))
            # Construir la URL completa de la imagen
            imagen_url=None
            if situacion_elegida.imagen_url:
            # request.build_absolute_uri genera la URL completa incluyendo host y puerto
               imagen_url = request.build_absolute_uri(situacion_elegida.imagen_url)
            return Response({
                "tema":tema_elegido,
                "situacion":{
                    "id": situacion_elegida.id,
                    "titulo": situacion_elegida.situacion,
                    "contexto": situacion_elegida.contexto,
                    "recomendacion":situacion_elegida.recomendacion,
                    "tipo_simulacion":situacion_elegida.tipo_simulacion,
                    "tiempo": situacion_elegida.tiempo,
                    "imagen_url":imagen_url
                }
            })

        except PreferenciasUsuarios.DoesNotExist:
            return Response({"error": "No se encontraron preferencias para este usuario."}, status=404)

        except Exception as e:
            import traceback
            print("ERROR DETECTADO:")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)
     









class ObtenerTemasPreferidos(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        try:
            #Se obtienen los temas preferidos del usuario apartir de sus preferencias
            preferencias=PreferenciasUsuarios.objects.get(usuario=request.user)
            temas=preferencias.temas_preferencia
            return Response({"temas":temas})
        except PreferenciasUsuarios.DoesNotExist:
            return Response({"error": "No se encontraron preferencias para este usuario."}, status=404)







class GenerarSituacionTemaAleatorio(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
             #Se modifico para solo filtre con modo_aleatorio
            situaciones_varias=Practicas.objects.filter(tipo_simulacion='modo_aleatorio')

            if not situaciones_varias.exists():
                return Response({"error":"No hay situaciones registradas."},status=404)
            
            situacion_elegida=random.choice(list(situaciones_varias))

            imagen_url=None
            if situacion_elegida.imagen_url:
            # request.build_absolute_uri genera la URL completa incluyendo host y puerto
               imagen_url = request.build_absolute_uri(situacion_elegida.imagen_url)

            return Response({
                "tema":situacion_elegida.tema,
                "situacion": {
                     "id": situacion_elegida.id,
                    "titulo": situacion_elegida.situacion,
                    "contexto": situacion_elegida.contexto,
                    "recomendacion": situacion_elegida.recomendacion,
                    "tipo_simulacion": situacion_elegida.tipo_simulacion,
                    "tiempo": situacion_elegida.tiempo,
                    "imagen_url":imagen_url
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

        claridad=obtener_claridad(practica_hecha_id,transcripcion)

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
            claridad = claridad,
            coherencia=coherencia,
            retroalimentacion=retroalimentacion
                  
        )

        return Response({"mensaje": "Transcripción guardada correctamente", "id": evaluacion.id}, status=201)
    





"""nlp=spacy.load("es_core_news_sm")

muletillas_comunes={'este','eh','bueno','entonces','pos','pues','mmm','ah','vale','sabes','o','sea','como', 'no?' , 'entiendes','sabes',','digamos','claro','obviamente'}

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

    return posibles_muletillas"""


nlp = spacy.load("es_core_news_sm")

muletillas_comunes = {'este', 'eh', 'bueno', 'entonces', 'pos', 'pues', 'mmm', 'ah', 'vale', 'sabes', 'o', 'sea', 'como', 'no?' , 'entiendes','sabes','digamos','claro','obviamente'}

"""
def detectar_muletillas(texto):
    # SPACY: Procesa el texto y lo convierte en documento lingüístico
    doc = nlp(texto.lower())
    palabras_repetidas = Counter()
    
    # SPACY: Analiza cada token (palabra) del texto
    for token in doc:
        # SPACY: Filtra puntuación, espacios y palabras muy cortas
        if token.is_punct or token.is_space or len(token.text) <= 2:
            continue
        palabras_repetidas[token.text] += 1
    
    posibles_muletillas = {}
    for palabra, frecuencia in palabras_repetidas.items():
        if frecuencia > 2:
            # SPACY: Encuentra el token para analizar sus propiedades
            token_filtrado = next((t for t in doc if t.text == palabra), None)
            # SPACY: Usa el POS tagging para identificar tipos de palabras
            if (palabra in muletillas_comunes or 
                (token_filtrado and token_filtrado.pos_ in {"INTJ", "CCONJ", "SCONJ", "PART"})):
                posibles_muletillas[palabra] = frecuencia
    
    return posibles_muletillas

"""

def detectar_muletillas(texto):
    doc = nlp(texto.lower())
    palabras_repetidas = Counter()
    
    for token in doc:
        if token.is_punct or token.is_space or len(token.text) <= 2:
            continue
        palabras_repetidas[token.text] += 1
    
    mensajes_errores = {}
    
    for palabra, frecuencia in palabras_repetidas.items():
        if frecuencia > 2:
            token_filtrado = next((t for t in doc if t.text == palabra), None)
            if (palabra in muletillas_comunes or 
                (token_filtrado and token_filtrado.pos_ in {"INTJ", "CCONJ", "SCONJ", "PART"})):
                
                
                if frecuencia >= 5:
                    mensaje = f"Usas '{palabra}' con mucha frecuencia ({frecuencia} veces). Intenta reducir su uso."
                elif frecuencia >= 3:
                    mensaje = f"Usas '{palabra}' varias veces ({frecuencia} veces). Puedes intentar variar tu vocabulario."
                else:
                    mensaje = f"Detectamos '{palabra}' repetida {frecuencia} veces."
                
               
                error_id = f"muletilla_{palabra}"
                mensajes_errores[error_id] = mensaje
    
    return mensajes_errores




def obtener_claridad(practica_hecha_id, texto_transcripcion):
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

Evalúa el discurso en relacion a la situacion, el contexto y la recomendacion.Luego, evalúa la claridad del discurso ¿Es facil de entender?¿Se relaciona con el contexto proporcionado?.Esta evaluacion debe estar resumida en 20 palabras en su conjunto

No intentes justificar contenido irrelevante inventando conexiones que no existen.Al final clasifica simple con Claro o No Claro.

Redacta una retroalimentación sin  ningun tipo de saludo ni expliques tu rol y sin usar formato Markdown ni negritas.
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

Redacta una retroalimentación sin  ningun tipo de saludo ni expliques tu rol y sin usar formato Markdown ni negritas.
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
Redacta una retroalimentación sin  ningun tipo de saludo ni expliques tu rol y sin usar formato Markdown ni negritas.
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
                return Response({"error": f"No hay situaciones registradas para el tema'."}, status=404)
            
            #postura = random.choice(list('rol_afavor','rol_encontra'))
            

            # Elige una situación aleatoria del tema
            situacion_elegida = random.choice(list(situaciones))


           
            return Response({
     "tema": situacion_elegida.tema,
    "situacion": {
        "id": situacion_elegida.id,
        "titulo": situacion_elegida.situacion,
        "contexto": situacion_elegida.contexto,
        "rol_afavor": situacion_elegida.rol_afavor,
        "rol_encontra": situacion_elegida.rol_encontra,
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
            imagen_url = None
            if situacion_elegida.imagen_url:
                
                imagen_url = request.build_absolute_uri(situacion_elegida.imagen_url)
                print(f"URL de imagen generada: {imagen_url}")  

            return Response({
                "tema": situacion_elegida.tema,
                "situacion": {
                    "id": situacion_elegida.id,
                    "titulo": situacion_elegida.situacion,
                    "contexto": situacion_elegida.contexto,
                    "recomendacion": situacion_elegida.recomendacion,
                    "tipo_simulacion": situacion_elegida.tipo_simulacion,
                    "tiempo": situacion_elegida.tiempo,
                    "imagen_url": imagen_url,
                    "descripcion": situacion_elegida.descripcion,
                }
            })

        except PreferenciasUsuarios.DoesNotExist:
            return Response({"error": "No se encontraron simulacion en modo exposicion."}, status=404)

        except Exception as e:
            import traceback
            print("ERROR DETECTADO:")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)
        






class ObtenerAspectosEvaluados(APIView):
    def get(self,request,practica_hecha_id):
        try:
            aspecto=AspectosEvaluados.objects.get(
                practica_hecha_id=practica_hecha_id,
                practica_hecha__usuario=request.user
            )
            serializer=AspectosEvaluadosSerializer(aspecto)
            return Response(serializer.data)
        except AspectosEvaluados.DoesNotExist:
            return Response(
                {'error':'No se encontro el analisis de esta practica para este usuario.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except AspectosEvaluados.MultipleObjectsReturned:
            aspecto=AspectosEvaluados.objects.filter(
                practica_hecha_id=practica_hecha_id,
                practica_hecha__usuario=request.user
            ).latest('id')  
            serializer = AspectosEvaluadosSerializer(aspecto)
            return Response(serializer.data)



class PracticasHechasUsuario(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Solo trae prácticas que tienen al menos un registro en aspectos_evaluados
        practicas = PracticasHechas.objects.annotate(
            tiene_aspectos=Exists(
                AspectosEvaluados.objects.filter(practica_hecha_id=OuterRef('id'))
            )
        ).filter(tiene_aspectos=True, usuario=request.user).order_by('fecha')

        serializer = PracticaHechaSerializer(practicas, many=True)
        return Response(serializer.data)



class ActualizarEstadoPractica(APIView):
    permission_classes =[IsAuthenticated]
 
    def patch(self, request , practica_hecha_id):
        #Se ve el estado de la practica
        nuevo_estado = request.data.get('estado')
        #Se definen los posibles estados de la practica
        estados_validos = ['iniciada', 'completada', 'cancelada']

        if nuevo_estado not in estados_validos:
            return Response({"error": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            #Se verifica que la practica exista
            practica = PracticasHechas.objects.get(id=practica_hecha_id, usuario=request.user)
        except PracticasHechas.DoesNotExist:
            return Response({"error": "Práctica no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        #Se actualiza el estado de la practica a "completada"
        practica.estado = nuevo_estado
        practica.save()

        return Response({"mensaje": f"Estado actualizado a {nuevo_estado}"}, status=status.HTTP_200_OK)


