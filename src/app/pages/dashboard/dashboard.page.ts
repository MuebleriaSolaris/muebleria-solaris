import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient
import { AuthService } from '../../services/auth.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements AfterViewInit, OnInit {
  esGerente: boolean = false;
  totalInventario: number | null = null; // Variable para almacenar el total del inventario

  constructor(private authService: AuthService, private http: HttpClient) {} // Inyectar HttpClient

  ngOnInit() {
    // Obtener el ID del usuario desde AuthService
    const userId = this.authService.getUserId();
    
    if (userId) {
      // Realizar la llamada HTTP directamente en el componente
      this.http.get<boolean>(`https://muebleriasolaris.com/ionic-login/check_gerencia.php?userId=${userId}`)
        .subscribe((isGerente) => {
          this.esGerente = isGerente;
        });
    }
  }

  ngAfterViewInit() {
    this.renderSalesChart();
  }

  renderSalesChart() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
          {
            label: 'Ventas ($)',
            data: [8000, 12000, 15000, 11000, 14000, 18000],
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Método para calcular el total del inventario
  calcularTotalInventario() {
    this.http.get<any>('https://muebleriasolaris.com/ionic-products/inventory_provider_total.php')
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.totalInventario = response.total_inventario; // Asignar el total del inventario
          } else {
            console.error('Error al calcular el inventario:', response.message);
          }
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
        }
      });
  }
}