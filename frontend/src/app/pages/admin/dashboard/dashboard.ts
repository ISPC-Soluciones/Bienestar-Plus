import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { EstadisticasService } from '../../../services/estadisticas.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  loading = true;
  error = '';

  totalUsuarios = 0;
  totalRutinas = 0;
  progresosCompletados = 0;

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Ejercicios más populares' },
    },
  };

  barChartType: ChartType = 'bar';
  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de rutinas',
        data: [],
        backgroundColor: [
          '#00bfa5',
          '#007bff',
          '#ffc107',
          '#ff5722',
          '#9c27b0',
        ],
      },
    ],
  };

  constructor(
    private http: HttpClient,
    private estadisticasService: EstadisticasService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
    this.estadisticasService.refrescar.subscribe(() => {
      this.cargarEstadisticas();
    });
  }

  cargarEstadisticas() {
    this.loading = true;
    this.error = '';

    const usuarioId = localStorage.getItem('usuario_id');

    this.estadisticasService.obtenerEstadisticas().subscribe({
      next: (data) => {
        let urlConFiltro = `${environment.backendUrl}/api/estadisticas/`;
        if (usuarioId && usuarioId !== 'null') {
          urlConFiltro = `${urlConFiltro}?usuario_id=${usuarioId}`;
        }

        this.http.get<any>(urlConFiltro).subscribe({
          next: (data) => {
            this.totalUsuarios = data.total_usuarios || 0;
            this.totalRutinas = data.total_rutinas_registradas || 0;
            this.progresosCompletados = data.progresos_diarios_completados || 0;

            const ejercicios = data.ejercicios_mas_populares || [];

            this.barChartData = {
              ...this.barChartData,
              labels: ejercicios.map((e: any) => e.nombre),
              datasets: [
                {
                  ...this.barChartData.datasets[0],
                  data: ejercicios.map((e: any) => e.conteo_rutinas),
                },
              ],
            };

            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar estadísticas (Llamada final):', err);
            this.error =
              'No se pudieron cargar las estadísticas. Verifica la conexión o el ID de usuario.';
            this.loading = false;
          },
        });
      },
      error: (err) => {
        // En este caso, este bloque error no debería ejecutarse si el de arriba sí
        console.error('Error al obtener estadísticas del servicio:', err);
        this.loading = false;
      },
    });
  }
}