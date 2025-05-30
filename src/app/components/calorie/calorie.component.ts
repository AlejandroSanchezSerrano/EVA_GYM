import { Component, OnInit } from '@angular/core';
import { CalorieService } from '../../services/calorie.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OpenaiService } from '../../services/openai.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calorie',
  templateUrl: './calorie.component.html',
  styleUrls: ['./calorie.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CalorieComponent implements OnInit {
  calories: any[] = [];
  userId!: number;
  isLoggedIn: boolean = false;
  dailyCaloriasObjetivo: number = 0;
  caloriasHoy: number = 0;
  comidaTexto: string = '';

  constructor(
    private calorieService: CalorieService,
    private router: Router,
    private openaiService: OpenaiService
  ) {
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
        },
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
            .filter((c) => c.date === fechaHoy)
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
      },
    });
  }

  getCardClase(c: any): string {
    if (this.dailyCaloriasObjetivo === 0)
      return 'bg-dark border border-secondary';

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
        min: '0',
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(+value) || +value <= 0) {
          return 'Introduce un valor válido';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const calorias = parseInt(result.value, 10);
        const fechaActual = new Date().toISOString().substring(0, 10);

        this.calorieService
          .createCalorie(this.userId, calorias, fechaActual)
          .subscribe({
            next: () => {
              this.loadCalories();
              Swal.fire({
                icon: 'success',
                title: 'Registro guardado',
                text: 'Las calorías han sido registradas correctamente.',
              });
            },
            error: (err) => {
              // Mostrar alerta si ya existe un registro
              Swal.fire({
                icon: 'warning',
                title: 'Ya has registrado calorías hoy',
                text: 'Solo puedes registrar un consumo por día. Puedes editar el registro existente si lo necesitas.',
              });
              console.error('Error al guardar calorías:', err);
            },
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
        min: '0',
      },
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(+value) || +value <= 0) {
          return 'Introduce un valor válido';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const nuevasCalorias = parseInt(result.value, 10);
        const fechaActual = new Date().toISOString().substring(0, 10);

        this.calorieService
          .updateCalorie(calorie.id, nuevasCalorias, fechaActual)
          .subscribe(() => {
            this.loadCalories();
            Swal.fire({
              icon: 'success',
              title: 'Calorías actualizadas',
              text: 'El registro ha sido actualizado correctamente.',
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.calorieService.deleteCalorie(calorieId).subscribe(() => {
          this.loadCalories();
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El registro ha sido eliminado correctamente.',
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
          <p><i class="bi bi-square-fill text-danger"></i> <strong>Rojo:</strong> Consumo fuera del objetivo.</p>
        </div>
      `,
      confirmButtonText: 'Entendido',
    });
  }

  estimarCalorias() {
    if (!this.comidaTexto.trim()) {
      Swal.fire('Atención', 'Debes describir lo que comiste.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Estimando...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.openaiService.estimateCalories(this.comidaTexto).subscribe({
      next: (res) => {
        const respuestaIA = res.choices[0].message.content;
        Swal.fire({
          title: 'Resultado estimado',
          html: `Calorías estimadas: <strong>${respuestaIA}</strong><br>¿Deseas usar este valor?`,
          showCancelButton: true,
          confirmButtonText: 'Usar valor',
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('Respuesta IA:', respuestaIA);

            let caloriasNum: number;

            // Buscar línea que contenga "total" o "estimado"
            const totalMatch = respuestaIA.match(/total.*?(\d+)/i);

            if (totalMatch && totalMatch[1]) {
              caloriasNum = parseInt(totalMatch[1], 10);
            } else {
              // Fallback: usar el último número del texto
              const allMatches = respuestaIA.match(/\d+/g);
              if (allMatches && allMatches.length > 0) {
                caloriasNum = parseInt(allMatches[allMatches.length - 1], 10);
              } else {
                Swal.fire(
                  'Error',
                  'No se pudo interpretar la respuesta de la IA.',
                  'error'
                );
                return;
              }
            }

            this.agregarCaloriasDesdeIA(caloriasNum);
          }
        });
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo obtener la estimación.', 'error');
        console.error(err);
      },
    });
  }

  agregarCaloriasDesdeIA(kcal: number) {
    const fechaActual = new Date().toISOString().substring(0, 10);

    this.calorieService
      .createCalorie(this.userId, kcal, fechaActual)
      .subscribe({
        next: () => {
          this.loadCalories();
          Swal.fire(
            'Guardado',
            'Las calorías han sido registradas.',
            'success'
          );
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudieron guardar las calorías.', 'error');
          console.error(err);
        },
      });
  }
}
