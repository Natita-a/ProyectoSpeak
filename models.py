# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib.auth.models import User





class AspectosEvaluados(models.Model):
    id = models.BigAutoField(primary_key=True)
    practica_hecha = models.ForeignKey('PracticasHechas', models.DO_NOTHING, blank=True, null=True)
    transcripcion = models.TextField(blank=True, null=True)
    usuario = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True)
    lenguaje_corporal = models.TextField(blank=True, null=True)
    palabras_por_minuto = models.IntegerField(blank=True, null=True)
    tono = models.TextField(blank=True, null=True)
    claridad = models.TextField(blank=True, null=True)
    coherencia = models.TextField(blank=True, null=True)
    velocidad = models.TextField(blank=True, null=True)
    errores = models.JSONField(blank=True, null=True)#Nuevo campo
    retroalimentacion = models.TextField(blank=True, null=True)
    puntaje = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'aspectos_evaluados'



class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Practicas(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, blank=True, null=True)
    tema = models.TextField()
    situacion = models.TextField(blank=True, null=True)
    contexto = models.TextField(blank=True, null=True)
    recomendacion = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(blank=True, null=True)
    tipo_simulacion = models.TextField(blank=True, null=True)
    tiempo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'practicas'


class PreferenciasUsuarios(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, blank=True, null=True)
    proposito = models.TextField()
    temas_preferencia = models.TextField()  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'preferencias_usuarios'


class Usuarios(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='user_id', primary_key=True)
    verificado = models.BooleanField(default=False)
    codigo_verificacion = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios'

class PracticasHechas(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey('Usuarios', models.DO_NOTHING)
    simulacion = models.ForeignKey('Practicas', models.DO_NOTHING)
    fecha = models.DateTimeField(blank=True, null=True)
    estado = models.TextField(blank=True, null=True)
    resultado = models.JSONField(blank=True, null=True)
    tiempo_duracion = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'practicas_hechas'

