import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WeightService } from '../../services/weight.service';
import { Chart, registerables } from 'chart.js'; 
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

Chart.register(...registerables); // Registrar los componentes de Chart.js

@Component({
  selector: 'app-weight',
  templateUrl: './weight.component.html',
  styleUrls: ['./weight.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class WeightComponent implements OnInit {
  weightForm: FormGroup;
  weights: any[] = [];
  userId: number;
  editingWeight: any = null;
  chart: Chart | null = null; // Inicializamos la propiedad chart como null

  constructor(
    private fb: FormBuilder,
    private weightService: WeightService
  ) {
    this.weightForm = this.fb.group({
      weight: ['', [Validators.required, Validators.min(0)]],
      date: [new Date().toISOString().substring(0, 16), Validators.required]
    });

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
          this.updateChart(); // Actualiza el gráfico cuando se cargan los pesos
        } else {
          console.error('Error inesperado al cargar los pesos:', response);
        }
      }, error => {
        console.error('Error al cargar pesos:', error);
      });
  }

  saveWeight(): void {
  if (this.weightForm.invalid) {
    return;
  }

  const { weight, date } = this.weightForm.value;

  if (this.editingWeight) {
    // Editando peso existente
    this.weightService.updateWeight(this.editingWeight.id, weight, date)
      .subscribe(response => {
        this.editingWeight = null;
        this.weightForm.reset({
          weight: '',
          date: new Date().toISOString().substring(0, 16)
        });
        this.loadWeights();
        Swal.fire({
          icon: 'success',
          title: 'Peso actualizado',
          text: 'El peso ha sido actualizado correctamente.'
        });
      });
  } else {
    // Creando nuevo peso
    this.weightService.createWeight(weight, date, this.userId)
      .subscribe(response => {
        this.weightForm.reset({
          weight: '',
          date: new Date().toISOString().substring(0, 16)
        });
        this.loadWeights();
        Swal.fire({
          icon: 'success',
          title: 'Peso guardado',
          text: 'El nuevo peso ha sido registrado correctamente.'
        });
      });
  }
}


  updateChart(): void {
    const labels = this.weights.map(w => new Date(w.date).toLocaleDateString());
    const data = this.weights.map(w => w.weight);

    if (this.chart) {
      this.chart.destroy(); // Destruye el gráfico anterior para evitar conflictos
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

  editWeight(weight: any): void {
    this.editingWeight = weight;
    this.weightForm.setValue({
      weight: weight.weight,
      date: weight.date.substring(0, 16)
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
          .subscribe(response => {
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
  

  cancelEdit(): void {
    this.editingWeight = null;
    this.weightForm.reset({
      weight: '',
      date: new Date().toISOString().substring(0, 16)
    });
  }
}