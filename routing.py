from django.urls import re_path
from Proyecto import consumers

websocket_urlpatterns = [
    re_path(r'ws/speakup-lobby/$', consumers.SpeakUpConsumer.as_asgi()),
    re_path(r'ws/speakup/(?P<practica_id>\d+)/$', consumers.SpeakUpPracticeConsumer.as_asgi()),
]