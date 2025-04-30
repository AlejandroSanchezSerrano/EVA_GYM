import { Component, OnInit } from '@angular/core';
import { WeightService } from '../../services/weight.service';
import { Chart, registerables } from 'chart.js'; 
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-weight',
  templateUrl: './weight.component.html',
  styleUrls: ['./weight.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class WeightComponent implements OnInit {
  weights: any[] = [];
  userId: number;
  chart: Chart | null = null;

  constructor(private weightService: WeightService) {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
    } else {
      throw new Error('No se encontró user_id en localStorage.');
    }
  }

  ngOnInit(): void {
    this.loadWeights();
  }

  loadWeights(): void {
    this.weightService.getWeightsByUser(this.userId)
      .subscribe(response => {
        if (Array.isArray(response)) {
          this.weights = response;
          this.updateChart();
        } else {
          console.error('Error inesperado al cargar los pesos:', response);
        }
      }, error => {
        console.error('Error al cargar pesos:', error);
      });
  }

  addWeight(): void {
    Swal.fire({
      title: 'Añadir Peso',
      input: 'number',
      inputLabel: 'Introduce tu peso en kg',
      inputAttributes: {
        step: '0.01',
        min: '0'
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(+value) || +value <= 0) {
          return 'Introduce un peso válido';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const peso = parseFloat(result.value);
        const fechaActual = new Date().toISOString().substring(0, 16);

        this.weightService.createWeight(peso, fechaActual, this.userId)
          .subscribe(() => {
            this.loadWeights();
            Swal.fire({
              icon: 'success',
              title: 'Peso guardado',
              text: 'El nuevo peso ha sido registrado correctamente.'
            });
          });
      }
    });
  }

  editWeight(weight: any): void {
    Swal.fire({
      title: 'Editar Peso',
      input: 'number',
      inputLabel: 'Actualiza el peso en kg',
      inputValue: weight.weight,
      inputAttributes: {
        step: '0.01',
        min: '0'
      },
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(+value) || +value <= 0) {
          return 'Introduce un peso válido';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const nuevoPeso = parseFloat(result.value);
        const fechaActual = new Date().toISOString().substring(0, 16);

        this.weightService.updateWeight(weight.id, nuevoPeso, fechaActual)
          .subscribe(() => {
            this.loadWeights();
            Swal.fire({
              icon: 'success',
              title: 'Peso actualizado',
              text: 'El peso ha sido actualizado correctamente.'
            });
          });
      }
    });
  }

  deleteWeight(weightId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el peso registrado de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.weightService.deleteWeight(weightId)
          .subscribe(() => {
            this.loadWeights();
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El peso ha sido eliminado correctamente.'
            });
          });
      }
    });
  }

  updateChart(): void {
    const sortedWeights = [...this.weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const labels = sortedWeights.map(w => new Date(w.date).toLocaleDateString());
    const data = sortedWeights.map(w => w.weight);

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('weightChart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Peso (kg)',
          data: data,
          borderColor: 'rgba(135,242,87,255)',
          backgroundColor: 'rgba(132,69,190,255)',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Peso (kg)'
            },
            beginAtZero: true
          }
        }
      }
    });
  }
}
