import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PlanNutricional, PlanNutricionalDatos, TipoComida } from '../../models/plan-nutricional';
import { PlanNutricionalService } from '../../services/plan-nutricional';

const textoRequerido: ValidatorFn = (control: AbstractControl) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

@Component({
  selector: 'app-plan-nutricional',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './plan-nutricional.html',
  styleUrl: './plan-nutricional.css',
})
export class PlanNutricionalComponent implements OnInit {
  @Input() resumen = false;
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(PlanNutricionalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tipos: { valor: TipoComida; etiqueta: string }[] = [
    { valor: 'desayuno', etiqueta: 'Desayuno' }, { valor: 'almuerzo', etiqueta: 'Almuerzo' },
    { valor: 'merienda', etiqueta: 'Merienda' }, { valor: 'cena', etiqueta: 'Cena' },
    { valor: 'colacion', etiqueta: 'Colación' },
  ];
  readonly form = this.fb.nonNullable.group({
    nombre: ['', [textoRequerido, Validators.maxLength(100)]],
    objetivo: ['', [textoRequerido, Validators.maxLength(300)]],
    notas: ['', Validators.maxLength(2000)],
    comidas: this.fb.array([this.crearComida()]),
  });
  plan: PlanNutricional | null = null;
  cargando = true;
  guardando = false;
  editando = false;
  error = '';
  exito = '';
  requiereSesion = false;

  get comidas() { return this.form.controls.comidas; }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    if (this.guardando) return;
    this.cargando = true;
    this.error = '';
    this.exito = '';
    this.requiereSesion = false;
    this.editando = false;
    this.plan = null;
    this.servicio.consultar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (plan) => { this.plan = plan; this.cargando = false; },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error, 'No pudimos cargar tu plan. Intentá nuevamente.');
      },
    });
  }

  iniciarEdicion(): void {
    this.error = '';
    this.exito = '';
    this.form.reset({ nombre: this.plan?.nombre ?? '', objetivo: this.plan?.objetivo ?? '', notas: this.plan?.notas ?? '' });
    this.comidas.clear();
    const comidas = this.plan?.comidas ?? [{ tipo: 'desayuno' as TipoComida, descripcion: '', horario: null }];
    comidas.forEach((comida) => this.comidas.push(this.crearComida(comida)));
    this.editando = true;
  }

  agregarComida(): void {
    if (!this.guardando && this.comidas.length < 20) this.comidas.push(this.crearComida());
  }

  quitarComida(indice: number): void {
    if (!this.guardando && this.comidas.length > 1) this.comidas.removeAt(indice);
  }

  cancelar(): void {
    if (!this.guardando) { this.editando = false; this.error = ''; }
  }

  guardar(): void {
    if (this.guardando || this.cargando || this.requiereSesion) return;
    this.error = '';
    this.exito = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const valores = this.form.getRawValue();
    const datos: PlanNutricionalDatos = {
      nombre: valores.nombre.trim(), objetivo: valores.objetivo.trim(), notas: valores.notas.trim(),
      comidas: valores.comidas.map((comida) => ({
        tipo: comida.tipo, descripcion: comida.descripcion.trim(), horario: comida.horario || null,
      })),
    };
    this.guardando = true;
    this.form.disable();
    const operacion = this.plan ? this.servicio.editar(datos) : this.servicio.crear(datos);
    operacion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.guardando = false;
        this.form.enable();
        this.editando = false;
        this.exito = 'Tu plan quedó guardado.';
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.form.enable();
        this.mostrarError(error, 'No pudimos guardar el plan. Tus cambios siguen en el formulario.');
      },
    });
  }

  etiqueta(tipo: TipoComida): string { return this.tipos.find((opcion) => opcion.valor === tipo)?.etiqueta ?? tipo; }

  private crearComida(comida = { tipo: 'desayuno' as TipoComida, descripcion: '', horario: null as string | null }) {
    return this.fb.nonNullable.group({
      tipo: [comida.tipo, Validators.required],
      descripcion: [comida.descripcion, [textoRequerido, Validators.maxLength(500)]],
      horario: [comida.horario?.slice(0, 5) ?? '', Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)],
    });
  }

  private mostrarError(error: HttpErrorResponse, mensaje: string): void {
    this.requiereSesion = error.status === 401;
    if (this.requiereSesion) { this.error = 'Tu sesión no está activa. Iniciá sesión para gestionar tu plan.'; return; }
    if (error.status === 403) { this.error = 'No pudimos validar la sesión. Recargá la página e intentá nuevamente.'; return; }
    if (error.status === 409) { this.error = 'Ya existe un plan. Recargá para editarlo.'; return; }
    if (error.status === 404) { this.error = 'No se encontró el plan. Recargá para crear uno.'; return; }
    if (error.status === 400) {
      this.error = 'Revisá los datos del plan. ' + this.erroresValidacion(error.error);
      return;
    }
    this.error = mensaje;
  }

  private erroresValidacion(valor: unknown): string {
    if (typeof valor === 'string') return valor;
    if (Array.isArray(valor)) return valor.map((item) => this.erroresValidacion(item)).filter(Boolean).join(' ');
    if (valor && typeof valor === 'object') return Object.values(valor).map((item) => this.erroresValidacion(item)).filter(Boolean).join(' ');
    return '';
  }
}
