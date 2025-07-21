"""
URL configuration for Proyecto project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from Proyecto.views import RegistroUsuario
from Proyecto.views import GuardarProposito
from Proyecto.views import GuardarPreferencia
from Proyecto.views import VerificarPreferencias
from Proyecto.views import GenerarSituacionTemaPropio
from Proyecto.views import GenerarSituacionTemaAleatorio#Nuevo
from Proyecto.views import EscenarioPracticaPropia
from Proyecto.views import EscenarioPracticaAleatoria#Nuevo
from Proyecto.views import TranscripcionAudioView
from Proyecto.views import GuardarTranscripcionView
from Proyecto.views import GenerarSituacionModoDebate#Nuevo
from Proyecto.views import GenerarSituacionModoExposicion#Nuevo
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)





urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')), 
    path('api/registro/', RegistroUsuario.as_view(), name='registro_usuario'),
    path('api/guardar-proposito/', GuardarProposito.as_view(), name='guardar-proposito'),
    path('api/guardar-temas/', GuardarPreferencia.as_view(), name='guardar-preferencias'),
    path('api/verificar-preferencias/', VerificarPreferencias.as_view(), name='verificar_preferencias'),
    path('api/generar-temas/', GenerarSituacionTemaPropio.as_view(), name='generar-temas'),
    path('api/generar-tema-aleatorio/',GenerarSituacionTemaAleatorio.as_view(),name='generar-tema-aleatorio'),
    path('api/escena-propia/',EscenarioPracticaPropia.as_view(),name='escena-propia'),
    path('api/escena-aleatoria/',EscenarioPracticaAleatoria.as_view(),name='escena-aleatoria'),
    path('api/transcripcion/', TranscripcionAudioView.as_view(), name='transcripcion'),
    path('api/guardar-transcripcion/',GuardarTranscripcionView.as_view(),name='guardar-transcripcion'),
    path('api/generar-modo-debate/',GenerarSituacionModoDebate.as_view(),name='generar-modo-debate'),
    path('api/generar-modo-exposicion/',GenerarSituacionModoExposicion.as_view(),name='generar-modo-exposicion'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),


]
