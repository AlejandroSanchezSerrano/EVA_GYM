import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import {
  Exercise,
  SeriesDetail,
  TrainingService,
} from '../../services/training.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  standalone: true,
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css'],
  imports: [CommonModule, FormsModule],
})
export class TrainingComponent implements OnInit, AfterViewChecked {
  @ViewChild('exerciseChartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInitialized = false;

  ngAfterViewChecked(): void {
    if (
      this.selectedExerciseId &&
      this.exerciseLogs.length &&
      !this.chartInitialized
    ) {
      this.updateExerciseChart();
      this.chartInitialized = true;
    }
  }

  isLoggedIn: boolean = false;
  userId!: number;

  exercises: Exercise[] = [];
  selectedExerciseId: number | null = null;

  numSeries: number = 1;
  seriesInputs: SeriesDetail[] = [];

  loading = false;
  viewingHistory = false;

  editingLogId: number | null = null;

  exerciseLogs: {
    id?: number;
    exercise_id?: number;
    exercise_name?: string;
    date: string;
    series: { repetitions: number; weight: number }[];
  }[] = [];

  chart: Chart | null = null;

  constructor(
    private trainingService: TrainingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
      return;
    }

    this.trainingService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data;
      },
      error: (err) => {
        console.error('Error al cargar ejercicios:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los ejercicios.',
          confirmButtonColor: '#d33',
        });
      },
    });

    this.seriesInputs = [{ repetitions: null, weight: null }];
    this.loadTodayLogs();
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  historial(): void {
    this.router.navigate(['/history']);
  }

  onSeriesCountChange(): void {
    this.seriesInputs = Array.from({ length: this.numSeries }, () => ({
      repetitions: null,
      weight: null,
    }));
  }

  selectExercise(): void {
    const groups = Array.from(new Set(this.exercises.map((e) => e.group)));

    Swal.fire({
      title: 'Selecciona un grupo muscular',
      input: 'select',
      inputOptions: groups.reduce((acc, group) => {
        acc[group] = group;
        return acc;
      }, {} as Record<string, string>),
      inputPlaceholder: '-- Elegir grupo --',
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
    }).then((groupResult) => {
      if (groupResult.isConfirmed && groupResult.value) {
        const selectedGroup = groupResult.value;
        const filteredExercises = this.exercises.filter(
          (e) => e.group === selectedGroup
        );

        const exerciseOptions: Record<string, string> = {};
        filteredExercises.forEach((e) => {
          exerciseOptions[e.id] = e.name;
        });

        Swal.fire({
          title: 'Selecciona un ejercicio',
          input: 'select',
          inputOptions: exerciseOptions,
          inputPlaceholder: '-- Elegir ejercicio --',
          showCancelButton: true,
          confirmButtonText: 'Seleccionar',
        }).then((exerciseResult) => {
          if (exerciseResult.isConfirmed && exerciseResult.value) {
            this.selectedExerciseId = parseInt(exerciseResult.value, 10);
            this.viewingHistory = false;
            this.seriesInputs = [{ repetitions: null, weight: null }];
            this.numSeries = 1;
            this.loadExerciseLogs(this.selectedExerciseId);
          }
        });
      }
    });
  }

  loadExerciseLogs(exerciseId: number): void {
    this.trainingService.getExerciseLogs(this.userId, exerciseId).subscribe({
      next: (data) => {
        this.exerciseLogs = data.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Esperar un ciclo del DOM para que el *ngIf renderice el canvas
        setTimeout(() => {
          this.updateExerciseChart();
        }, 0);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el historial de este ejercicio.',
        });
        this.exerciseLogs = [];
        setTimeout(() => {
          this.updateExerciseChart();
        }, 0);
      },
    });
  }

  loadTodayLogs(): void {
    const today = new Date().toISOString().split('T')[0];
    this.trainingService.getTodayLogs(this.userId, today).subscribe({
      next: (data) => {
        this.exerciseLogs = data.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.updateExerciseChart();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los entrenamientos de hoy.',
        });
        this.exerciseLogs = [];
        this.updateExerciseChart();
      },
    });
  }

  updateExerciseChart(): void {
  if (this.chart) {
    this.chart.destroy();
    this.chart = null;
  }

  if (!this.exerciseLogs.length || !this.chartCanvas) return;

  const canvas = this.chartCanvas.nativeElement;
  if (!canvas) return;

  const labels: string[] = [];
  const weights: number[] = [];
  const repetitions: number[] = [];

  this.exerciseLogs.forEach((log) => {
    log.series.forEach((serie) => {
      const fecha = new Date(log.date).toLocaleDateString();
      labels.push(fecha);
      weights.push(serie.weight);
      repetitions.push(serie.repetitions);
    });
  });

  this.chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Peso (kg)',
          data: weights,
          borderColor: 'rgba(135, 242, 87, 1)',
          backgroundColor: 'rgba(135, 242, 87, 0.2)',
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Repeticiones',
          data: repetitions,
          borderColor: 'rgba(132, 69, 190, 1)',
          backgroundColor: 'rgba(132, 69, 190, 0.2)',
          tension: 0.3,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fecha',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Valor',
          },
          beginAtZero: true,
        },
      },
    },
  });
}


  submitTraining(): void {
    if (!this.selectedExerciseId || !this.seriesInputs.length) return;

    this.loading = true;

    const cleanedSeries: SeriesDetail[] = this.seriesInputs.map((s) => ({
      repetitions: s.repetitions ?? 0,
      weight: s.weight !== null && s.weight !== undefined ? s.weight : 0,
    }));

    if (this.editingLogId) {
      this.trainingService.deleteSeriesDetails(this.editingLogId).subscribe({
        next: () => {
          this.trainingService
            .createSeriesDetails(this.editingLogId!, cleanedSeries)
            .subscribe({
              next: () => {
                Swal.fire(
                  'Actualizado',
                  'Entrenamiento editado con éxito.',
                  'success'
                );
                this.resetForm();
                this.loadExerciseLogs(this.selectedExerciseId!);
              },
              error: () => {
                Swal.fire(
                  'Error',
                  'No se pudieron actualizar las series.',
                  'error'
                );
              },
              complete: () => (this.loading = false),
            });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo preparar la edición.', 'error');
          this.loading = false;
        },
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      this.trainingService
        .createExerciseLog(this.userId, this.selectedExerciseId, today)
        .subscribe({
          next: (res) => {
            this.trainingService
              .createSeriesDetails(res.exercise_log_id, cleanedSeries)
              .subscribe({
                next: () => {
                  Swal.fire(
                    '¡Éxito!',
                    'Entrenamiento registrado con éxito.',
                    'success'
                  );
                  this.resetForm();
                  this.loadTodayLogs();
                },
                error: () => {
                  Swal.fire(
                    'Error',
                    'No se pudieron guardar las series.',
                    'error'
                  );
                  this.loading = false;
                },
                complete: () => (this.loading = false),
              });
          },
          error: () => {
            Swal.fire('Error', 'No se pudo crear el log.', 'error');
            this.loading = false;
          },
        });
    }
  }

  getSelectedExerciseName(): string {
    const selected = this.exercises.find(
      (e) => e.id === this.selectedExerciseId
    );
    return selected ? selected.name : '';
  }

  eliminarLog(log: any): void {
    const logId = log.id ?? log.exercise_log_id;
    if (!logId) {
      console.error('No se encontró el ID del log.');
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar entrenamiento?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.trainingService.deleteExerciseLog(logId).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire(
                'Eliminado',
                'El entrenamiento ha sido eliminado.',
                'success'
              );
              if (this.selectedExerciseId) {
                this.loadExerciseLogs(this.selectedExerciseId);
              } else {
                this.loadTodayLogs();
              }
            } else {
              Swal.fire(
                'Error',
                res.message || 'No se pudo eliminar.',
                'error'
              );
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
          },
        });
      }
    });
  }

  editarLog(log: any): void {
    this.editingLogId = log.id;
    this.viewingHistory = false;
    this.selectedExerciseId = this.selectedExerciseId;
    this.seriesInputs = log.series.map((s: any) => ({
      repetitions: s.repetitions,
      weight: parseFloat(s.weight),
    }));
    this.numSeries = this.seriesInputs.length;
  }

  resetForm(): void {
    this.seriesInputs = [{ repetitions: null, weight: null }];
    this.numSeries = 1;
    this.selectedExerciseId = null;
    this.editingLogId = null;
    this.exerciseLogs = [];
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
