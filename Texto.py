import os
import sounddevice as sd
from scipy.io.wavfile import write
import whisper
from datetime import datetime
import textstat


duracion = 30  # Duración de la grabación en segundos
frecuencia = 16000  # Frecuencia de muestreo


carpeta_script = os.path.dirname(os.path.abspath(__file__))

# Crear nombre único para cada grabación
nombre_base = datetime.now().strftime("%Y%m%d_%H%M%S")
archivo_audio = os.path.join(carpeta_script, f"{nombre_base}.wav")
archivo_texto = os.path.join(carpeta_script, f"{nombre_base}.txt")

# ==== GRABAR AUDIO DESDE MICRÓFONO ====
print("Grabando....")
audio = sd.rec(int(duracion * frecuencia), samplerate=frecuencia, channels=1, dtype='int16')
sd.wait()  
write(archivo_audio, frecuencia, audio)  # Guarda el archivo de audio
print(f"Grabación finalizada y guardada en: {archivo_audio}")

# ==== TRANSCRIBIR AUDIO CON WHISPER ====
modelo = whisper.load_model("small")
resultado = modelo.transcribe(archivo_audio, word_timestamps=True)

# Calcular palabras
palabras = resultado['text'].split()
cant_palabras = len(palabras)
minutos = duracion / 60
ppm = cant_palabras / minutos

print(f"La cantidad de palabras es :{cant_palabras}")
print(f"La cantidad de palabras por minuto es :{ppm}")

# Evaluar velocidad
if ppm > 200:
     print("Hablas demasiado rápido! Deberías reducir tu velocidad.")
elif ppm > 170:
      print("Hablas un poco rapido")
elif ppm<100:
      print("Hablas muy lento")
else:
    print("Buena velocidad")


# ==== ANALIZAR PAUSAS LARGAS ====
pausas_largas = 0
umbral_pausa = 1.0  # segundos

for segmento in resultado['segments']:
    palabras_segmento = segmento['words']
    for i in range(len(palabras_segmento) - 1):
        fin_actual = palabras_segmento[i]['end']
        inicio_siguiente = palabras_segmento[i+1]['start']
        diferencia = inicio_siguiente - fin_actual

        if diferencia >= umbral_pausa:
            pausas_largas += 1
            print(f"⏸️ Pausa larga de {diferencia:.2f}s entre '{palabras_segmento[i]['word']}' y '{palabras_segmento[i+1]['word']}'")

print(f"Total de pausas largas detectadas: {pausas_largas}")



muletillas_comunes = [
    "eh", "ehh", "este", "pues", "o sea", "bueno", "ok", "vale", "¿no?",'la verdad','¿si?','sino','pero','a ver','es decir','vale?','pos','pues nada','ea','es que'
]


texto = resultado['text'].lower()  
contador_muletillas = {}

for muletilla in muletillas_comunes:
    cantidad = texto.count(muletilla)
    if cantidad > 0:
        contador_muletillas[muletilla] = cantidad

# Mostrar resultados
if contador_muletillas:
    print("🔍 Muletillas detectadas:")
    for m, c in contador_muletillas.items():
        print(f"👉 '{m}': {c} veces")
else:
    print("✅ No se detectaron muletillas.")




print("Facilidad de lectura de Flesch:", textstat.flesch_reading_ease(texto))
print("Grado Flesch-Kincaid:", textstat.flesch_kincaid_grade(texto))
print("Índice SMOG:", textstat.smog_index(texto))


# ==== GUARDAR TRANSCRIPCIÓN EN UN ARCHIVO ====
with open(archivo_texto, "w", encoding="utf-8") as f:
    f.write(f"Texto reconocido:\n{resultado['text']}\n\n")
print(f"Transcripción guardada en: {archivo_texto}")
