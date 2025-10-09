import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.http.get<any>('http://localhost:8000/api/estadisticas/').subscribe({
      next: (data) => {
        this.totalUsuarios = data.total_usuarios || 0;
        this.totalRutinas = data.total_rutinas_registradas || 0;

        const ejercicios = data.ejercicios_mas_populares || [];

        // ✅ Mapear correctamente los nombres de las propiedades
        this.barChartData.labels = ejercicios.map((e: any) => e.nombre);
        this.barChartData.datasets[0].data = ejercicios.map(
          (e: any) => e.conteo_rutinas
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.error = 'No se pudieron cargar las estadísticas.';
        this.loading = false;
      },
    });
  }
}
