from rest_framework import serializers
from .models import PreferenciasUsuarios

class PreferenciasUsuariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreferenciasUsuarios
        fields = ['usuario', 'proposito', 'temas_preferencia']
        read_only_fields = ['usuario']

    def create(self, validated_data):
        usuario = self.context['usuario']
        return PreferenciasUsuarios.objects.create(usuario=usuario, **validated_data)
