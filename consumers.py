import json
from channels.generic.websocket import AsyncWebsocketConsumer
import uuid
import httpx
from urllib.parse import parse_qs
import copy
import random
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken


# --- Estados globales ---
WAITING_USERS = []
ACTIVE_PAIRS = []  
CONNECTED_USERS = set()
ACCEPTED_USERS = {} 


class SpeakUpConsumer(AsyncWebsocketConsumer):
    async def connect(self):
     
        query_params = parse_qs(self.scope["query_string"].decode())
        token = query_params.get("token", [None])[0]

        if not token:
            print("❌ No se recibió token, cerrando conexión")
            await self.close()
            return

        await self.accept()
        CONNECTED_USERS.add(self.channel_name)
        await self.broadcast_connected_users()

        # 🔹 Emparejamiento
        if WAITING_USERS:
            partner = WAITING_USERS.pop(0)
            sala_id = str(uuid.uuid4())

            
            headers = {"Authorization": f"Bearer {token}"}
            async with httpx.AsyncClient() as api:
                response = await api.get(
                    "http://localhost:8000/api/generar-modo-debate/",
                    headers=headers
                )
                situacion = response.json()

            # Elegir aleatoriamente posturas
            if random.choice([True, False]):
                user1_postura = situacion["situacion"]["rol_afavor"]
                user2_postura = situacion["situacion"]["rol_encontra"]
            else:
                user1_postura = situacion["situacion"]["rol_encontra"]
                user2_postura = situacion["situacion"]["rol_afavor"]

           
            situacion_usuario1 = copy.deepcopy(situacion)
            situacion_usuario1["situacion"]["postura"] = user1_postura

            situacion_usuario2 = copy.deepcopy(situacion)
            situacion_usuario2["situacion"]["postura"] = user2_postura

            # Guardar el par activo con la situación original
            ACTIVE_PAIRS.append({
                "sala_id": sala_id,
                "users": [self.channel_name, partner],
                "situacion": situacion
            })

            sala_group = f"sala_{sala_id}"
            await self.channel_layer.group_add(sala_group, self.channel_name)
            await self.channel_layer.group_add(sala_group, partner)

            CONNECTED_USERS.discard(self.channel_name)
            CONNECTED_USERS.discard(partner)

            #  Enviar a cada usuario su situación individual
            await self.channel_layer.send(self.channel_name, {
                "type": "paired",
                "sala_id": sala_id,
                "situacion": situacion_usuario1,
                "partner_channel": partner  
            })
            await self.channel_layer.send(partner, {
                "type": "paired",
                "sala_id": sala_id,
                "situacion": situacion_usuario2,
                "partner_channel": self.channel_name 
            })
        else:
            WAITING_USERS.append(self.channel_name)

    async def disconnect(self, close_code):
        CONNECTED_USERS.discard(self.channel_name)
        if self.channel_name in WAITING_USERS:
            WAITING_USERS.remove(self.channel_name)

    
        for sala_id, users_set in ACCEPTED_USERS.items():
            users_set.discard(self.channel_name)

        await self.broadcast_connected_users()

    # --- Recibir mensajes ---
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "user_accepted":
            sala_id = data.get("sala_id")
            await self.user_accepted({"sala_id": sala_id})

    # --- Manejar aceptación de usuario ---
    async def user_accepted(self, event):
        sala_id = event["sala_id"]

        if sala_id not in ACCEPTED_USERS:
            ACCEPTED_USERS[sala_id] = set()

        ACCEPTED_USERS[sala_id].add(self.channel_name)

    
        pair = next((p for p in ACTIVE_PAIRS if p["sala_id"] == sala_id), None)

        if pair:
            if ACCEPTED_USERS[sala_id] == set(pair["users"]):
                print(f"✅ Ambos aceptaron en sala {sala_id}")

              
                situacion = pair.get("situacion", {}).get("situacion", {})
                tiempo = situacion.get("tiempo")
                practica_id = situacion.get("id", None)

                # Enviar inicio de práctica con datos reales
                for user in pair["users"]:
                    await self.channel_layer.send(user, {
                        "type": "start_practice",
                        "sala_id": sala_id,
                        "situacion": {
                            "id": practica_id,
                            "tiempo": tiempo
                        },
                        "mensaje": "Ambos aceptaron, iniciando práctica...",
                        "partner_channel": next(u for u in pair["users"] if u != user)  # ✅ Nuevo
                    })
            else:
                # Solo uno aceptó -> avisar al otro
                other_user = next(u for u in pair["users"] if u != self.channel_name)
                await self.channel_layer.send(other_user, {
                    "type": "partner_accepted",
                    "sala_id": sala_id,
                    "mensaje": "Tu compañero ya aceptó, faltas tú"
                })

    async def partner_accepted(self, event):
        await self.send(text_data=json.dumps({
            "action": "partner_accepted",
            "sala_id": event["sala_id"],
            "mensaje": event["mensaje"]
        }))

  
    async def start_practice(self, event):
        await self.send(text_data=json.dumps({
            "action": "start_practice",
            "sala_id": event["sala_id"],
            "situacion": event.get("situacion"),
            "mensaje": event["mensaje"],
            "partner_channel": event.get("partner_channel")  
        }))


    async def paired(self, event):
        await self.send(text_data=json.dumps({
            "action": "paired",
            "sala_id": event["sala_id"],
            "situacion": event["situacion"],
            "partner_channel": event.get("partner_channel")  
        }))

    async def broadcast_connected_users(self):
        for user in CONNECTED_USERS:
            await self.channel_layer.send(user, {
                "type": "connected_users_message",
                "count": len(CONNECTED_USERS)
            })

    async def connected_users_message(self, event):
        await self.send(text_data=json.dumps({
            "action": "connected-users",
            "count": event["count"]
        }))


class SpeakUpPracticeConsumer(AsyncWebsocketConsumer):
    async def authenticate_token(self, token):
        """Valida JWT y retorna usuario o AnonymousUser"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            User = get_user_model()
            try:
                user = await sync_to_async(User.objects.get)(id=user_id)
                return user
            except User.DoesNotExist:
                return AnonymousUser()
        except Exception as e:
            print(f"❌ Error autenticación token: {e}")
            return None

    async def connect(self):
        try:
            query_params = parse_qs(self.scope["query_string"].decode())
            token = query_params.get("token", [None])[0]
            if not token:
                await self.close()
                return

            user = await self.authenticate_token(token)
            if not user or not getattr(user, "is_authenticated", False):
                await self.close()
                return

            self.user = user
            self.practica_id = self.scope['url_route']['kwargs'].get('practica_id')
            self.room_group_name = f'practica_{self.practica_id}'

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            print(f"✅ {user.username} conectado a práctica {self.practica_id}")

        except Exception as e:
            print(f"❌ Error en connect(): {e}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            if hasattr(self, "room_group_name"):
                await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
             
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "webrtc_peer_disconnected",
                        "sender_channel": self.channel_name
                    }
                )
        except Exception as e:
            print(f"❌ Error en disconnect(): {e}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            message = data.get('message', {})
            
          
            if action == 'webrtc_offer':
                await self.channel_layer.send(
                    message.get('target_channel'),
                    {
                        "type": "webrtc_offer",
                        "sdp": message.get('sdp'),
                        "sender_channel": self.channel_name
                    }
                )
                
            elif action == 'webrtc_answer':
                await self.channel_layer.send(
                    message.get('target_channel'),
                    {
                        "type": "webrtc_answer",
                        "sdp": message.get('sdp'),
                        "sender_channel": self.channel_name
                    }
                )
                
            elif action == 'webrtc_ice_candidate':
                await self.channel_layer.send(
                    message.get('target_channel'),
                    {
                        "type": "webrtc_ice_candidate",
                        "candidate": message.get('candidate'),
                        "sender_channel": self.channel_name
                    }
                )
                
            elif action == 'webrtc_ready':
          
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "webrtc_peer_ready",
                        "sender_channel": self.channel_name
                    }
                )

        except Exception as e:
            print(f"❌ Error en receive(): {e}")
            await self.send(text_data=json.dumps({
                "action": "error",
                "message": str(e)
            }))

    
    async def webrtc_offer(self, event):
        await self.send(text_data=json.dumps({
            "action": "webrtc_offer",
            "sdp": event["sdp"],
            "sender_channel": event["sender_channel"]
        }))

    async def webrtc_answer(self, event):
        await self.send(text_data=json.dumps({
            "action": "webrtc_answer",
            "sdp": event["sdp"],
            "sender_channel": event["sender_channel"]
        }))

    async def webrtc_ice_candidate(self, event):
        await self.send(text_data=json.dumps({
            "action": "webrtc_ice_candidate",
            "candidate": event["candidate"],
            "sender_channel": event["sender_channel"]
        }))

    async def webrtc_peer_ready(self, event):
       await self.send(text_data=json.dumps({
        "action": "webrtc_peer_ready",
        "sender_channel": event["sender_channel"]
            }))

    async def webrtc_peer_disconnected(self, event):
     
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "action": "webrtc_peer_disconnected",
                "sender_channel": event["sender_channel"]
            }))

