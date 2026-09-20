import json

from channels.generic.websocket import AsyncWebsocketConsumer


class NotificacionesConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.usuario_id = self.scope['url_route']['kwargs']['usuario_id']

        self.grupo_nombre = f'notificaciones_{self.usuario_id}'

        await self.channel_layer.group_add(
            self.grupo_nombre,
            self.channel_name
        )

        await self.accept()

        print(
            f'WebSocket conectado para usuario {self.usuario_id}'
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.grupo_nombre,
            self.channel_name
        )

        print(
            f'WebSocket desconectado para usuario {self.usuario_id}'
        )

    async def enviar_notificacion(self, event):
        await self.send(text_data=json.dumps({
            'tipo': 'nueva_notificacion',
            'mensaje': event['mensaje'],
            'notificacion_id': event.get('notificacion_id'),
        }))