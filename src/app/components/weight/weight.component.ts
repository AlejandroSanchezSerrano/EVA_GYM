import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { WeightService } from '../../services/weight.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; // Asegúrate de importar SweetAlert2

@Component({
  selector: 'app-weight',
  templateUrl: './weight.component.html',
  imports: [ReactiveFormsModule, CommonModule]
})
export class WeightComponent implements OnInit {
  weightForm: FormGroup;
  weights: any[] = [];
  userId: number;
  editingWeight: any = null;

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
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: response.message,
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          });
          
          this.editingWeight = null;
          this.weightForm.reset({
            weight: '',
            date: new Date().toISOString().substring(0, 16)
          });
          this.loadWeights();
        });
    } else {
      // Creando nuevo peso
      this.weightService.createWeight(weight, date, this.userId)
        .subscribe(response => {
          Swal.fire({
            icon: 'success',
            title: 'Registrado',
            text: response.message,
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          });
          this.weightForm.reset({
            weight: '',
            date: new Date().toISOString().substring(0, 16)
          });
          this.loadWeights();
        });
    }
  }

  editWeight(weight: any): void {
    this.editingWeight = weight;
    this.weightForm.setValue({
      weight: weight.weight,
      date: weight.date.substring(0, 16)
    });
  }

  deleteWeight(weightId: number): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success mx-1',
        cancelButton: 'btn btn-danger mx-1'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: 'Este registro de peso será eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.weightService.deleteWeight(weightId)
          .subscribe(response => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: response.message,
              confirmButtonText: 'OK',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            });
            this.loadWeights();
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
