import csv

from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView

from .models import ComidaPlan, PlanNutricional, ProgresoDiario, RutinaEjercicio
from .nutrition_views import UsuarioSessionAuthentication

ENCABEZADOS = ['Sección', 'Fecha', 'Concepto', 'Detalle', 'Valor', 'Unidad']
SIN_DATOS = 'Sin datos registrados'


def _fecha(valor):
    return valor.strftime('%d/%m/%Y') if valor else ''


def _si_no(valor):
    return 'Sí' if valor else 'No'


def _decimal(valor):
    # Excel en español usa coma decimal: 7.5 se escribe 7,5.
    return f'{valor:.1f}'.replace('.', ',')


def _texto(valor):
    # Evita que un texto escrito por el usuario (ej. '=HIPERVINCULO(...)') se ejecute como fórmula en Excel.
    texto = str(valor or '')
    return f"'{texto}" if texto[:1] in ('=', '+', '-', '@') else texto


def filas_plan_nutricional(usuario):
    plan = PlanNutricional.objects.filter(usuario=usuario).first()
    if plan is None:
        return [['Plan nutricional', '', SIN_DATOS, '', '', '']]

    filas = [['Plan nutricional', _fecha(timezone.localtime(plan.actualizado)), _texto(plan.nombre), _texto(plan.objetivo), '', '']]
    if plan.notas:
        filas.append(['Plan nutricional', '', 'Notas', _texto(plan.notas), '', ''])
    for comida in plan.comidas.all():
        horario = comida.horario.strftime('%H:%M') if comida.horario else ''
        filas.append(['Plan nutricional', '', ComidaPlan.Tipo(comida.tipo).label, _texto(comida.descripcion), horario, 'hora'])
    return filas


def filas_habitos_diarios(usuario):
    progresos = (
        ProgresoDiario.objects.filter(usuario=usuario)
        .select_related('habito')
        .order_by('-fecha', 'habito__nombre')
    )
    filas = []
    for progreso in progresos:
        if progreso.valor is not None:
            valor, unidad = _decimal(progreso.valor), 'horas'
        else:
            valor, unidad = _si_no(progreso.completado), 'cumplido'
        filas.append(['Hábitos diarios', _fecha(progreso.fecha), progreso.habito.nombre, '', valor, unidad])
    return filas or [['Hábitos diarios', '', SIN_DATOS, '', '', '']]


def filas_rutina_ejercicios(usuario):
    rutinas = (
        RutinaEjercicio.objects.filter(usuario=usuario)
        .select_related('ejercicio')
        .order_by('-fecha_registro', 'ejercicio__nombre')
    )
    filas = []
    completadas = 0
    for rutina in rutinas:
        completadas += rutina.completado
        estado = 'Completado' if rutina.completado else 'Pendiente'
        filas.append([
            'Rutina de ejercicios', _fecha(rutina.fecha_registro), _texto(rutina.ejercicio.nombre),
            f'{rutina.ejercicio.get_tipo_display()} - {estado}', rutina.meta_cantidad, 'repeticiones/km',
        ])
    if not filas:
        return [['Rutina de ejercicios', '', SIN_DATOS, '', '', '']]

    total = len(filas)
    filas.append(['Estadísticas', '', 'Ejercicios registrados', '', total, 'ejercicios'])
    filas.append(['Estadísticas', '', 'Ejercicios completados', '', completadas, 'ejercicios'])
    filas.append(['Estadísticas', '', 'Cumplimiento', '', round(completadas * 100 / total), '%'])
    return filas


class ExportarDatosView(APIView):
    """
    GET /api/exportar-datos/
    Descarga un CSV con los datos del usuario en sesión. Nunca recibe un id por
    parámetro: solo puede exportar sus propios datos.
    """

    authentication_classes = [UsuarioSessionAuthentication]

    def get(self, request):
        usuario = request.user
        hoy = timezone.localdate()

        respuesta = HttpResponse(content_type='text/csv; charset=utf-8')
        respuesta['Content-Disposition'] = f'attachment; filename="bienestar_mis_datos_{hoy:%Y-%m-%d}.csv"'
        respuesta['Cache-Control'] = 'no-store'
        # BOM + ';' para que Excel en español muestre bien los acentos y separe las columnas.
        respuesta.write('\ufeff')
        writer = csv.writer(respuesta, delimiter=';')

        writer.writerow(['Bienestar Plus - Exportación de datos'])
        writer.writerow(['Usuario', _texto(usuario.nombre)])
        writer.writerow(['Generado', timezone.localtime().strftime('%d/%m/%Y %H:%M')])
        writer.writerow([])
        writer.writerow(ENCABEZADOS)
        writer.writerows(filas_plan_nutricional(usuario))
        writer.writerows(filas_habitos_diarios(usuario))
        writer.writerows(filas_rutina_ejercicios(usuario))
        return respuesta