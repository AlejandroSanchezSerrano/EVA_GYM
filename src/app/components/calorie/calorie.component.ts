import { Component, OnInit } from '@angular/core';
import { CalorieService } from '../../services/calorie.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calorie',
  templateUrl: './calorie.component.html',
  styleUrls: ['./calorie.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CalorieComponent implements OnInit {
  calories: any[] = [];
  userId!: number;
  isLoggedIn: boolean = false;
  dailyCaloriasObjetivo: number = 0;
  caloriasHoy: number = 0;

  constructor(private calorieService: CalorieService, private router: Router) {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
      this.isLoggedIn = true;
    }
  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.calorieService.getDailyCalories(this.userId).subscribe({
        next: (res) => {
          this.dailyCaloriasObjetivo = res.daily_calories;
          this.loadCalories();
        },
        error: (err) => {
          console.error('Error al obtener calorías objetivo:', err);
          this.loadCalories(); // sigue aunque falle
        }
      });
    }
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  loadCalories(): void {
    this.calorieService.getCaloriesByUser(this.userId).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.calories = response;
  
          const fechaHoy = new Date().toISOString().substring(0, 10);
          const caloriasHoyCalculadas = this.calories
            .filter(c => c.date === fechaHoy)
            .reduce((sum, c) => sum + Number(c.calories_consumed), 0);
  
          // Aseguramos actualización explícita
          setTimeout(() => {
            this.caloriasHoy = caloriasHoyCalculadas;
          });
        } else {
          console.error('Error inesperado al cargar las calorías:', response);
        }
      },
      error: (error) => {
        console.error('Error al cargar calorías:', error);
      }
    });
  }
  
  getCardClase(c: any): string {
    if (this.dailyCaloriasObjetivo === 0) return 'bg-dark border border-secondary';
  
    const ratio = c.calories_consumed / this.dailyCaloriasObjetivo;
  
    return ratio <= 1
      ? 'bg-dark border border-2 border-success'
      : 'bg-dark border border-2 border-danger';
  }
  

  addCalorie(): void {
    Swal.fire({
      title: 'Añadir Calorías',
      input: 'number',
      inputLabel: 'Introduce las calorías consumidas',
      inputAttributes: {
        step: '1',
        min: '0'
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(+value) || +value <= 0) {
          return 'Introduce un valor válido';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const calorias = parseInt(result.value, 10);
        const fechaActual = new Date().toISOString().substring(0, 10);

        this.calorieService.createCalorie(this.userId, calorias, fechaActual)
          .subscribe(() => {
            this.loadCalories();
            Swal.fire({
              icon: 'success',
              title: 'Registro guardado',
              text: 'Las calorías han sido registradas correctamente.'
            });
          });
      }
    });
  }

  editCalorie(calorie: any): void {
    Swal.fire({
      title: 'Editar Calorías',
      input: 'number',
      inputLabel: 'Actualiza las calorías consumidas',
      inputValue: calorie.calories_consumed,
      inputAttributes: {
        step: '1',
        min: '0'
      },
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(+value) || +value <= 0) {
          return 'Introduce un valor válido';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const nuevasCalorias = parseInt(result.value, 10);
        const fechaActual = new Date().toISOString().substring(0, 10);

        this.calorieService.updateCalorie(calorie.id, nuevasCalorias, fechaActual)
          .subscribe(() => {
            this.loadCalories();
            Swal.fire({
              icon: 'success',
              title: 'Calorías actualizadas',
              text: 'El registro ha sido actualizado correctamente.'
            });
          });
      }
    });
  }

  deleteCalorie(calorieId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.calorieService.deleteCalorie(calorieId)
          .subscribe(() => {
            this.loadCalories();
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El registro ha sido eliminado correctamente.'
            });
          });
      }
    });
  }

  mostrarInfo(): void {
    Swal.fire({
      icon: 'info',
      title: 'Información del registro',
      html: `
        <div class="text-start">
          <p>Solo se puede realizar un registro de consumo por día (se puede modificar y ir sumando lo que vas consumiendo durante el dia)</p>
          <p><i class="bi bi-square-fill text-success"></i> <strong>Verde:</strong> Consumo dentro del objetivo.</p>
          <p><i class="bi bi-square-fill text-danger"></i> <strong>Rojo:</strong> Objetivo de calorías superado.</p>
        </div>
      `,
      confirmButtonText: 'Entendido'
    });
  }
  
}
