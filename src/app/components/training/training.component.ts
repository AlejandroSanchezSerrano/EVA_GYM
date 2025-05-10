import { Component, OnInit } from '@angular/core';
import {
  Exercise,
  SeriesDetail,
  TrainingService,
} from '../../services/training.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css'],
  imports: [CommonModule, FormsModule],
})
export class TrainingComponent implements OnInit {
  isLoggedIn: boolean = false;
  userId!: number;

  exercises: Exercise[] = [];
  selectedExerciseId: number | null = null;

  numSeries: number = 1;
  seriesInputs: SeriesDetail[] = [];

  loading = false;
  viewingHistory = false;

  exerciseLogs: {
    date: string;
    series: { repetitions: number; weight: number }[];
  }[] = [];

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
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  onSeriesCountChange(): void {
    this.seriesInputs = Array.from({ length: this.numSeries }, () => ({
      repetitions: null,
      weight: null,
    }));
  }

  selectExercise(): void {
  const inputOptions: Record<string, string> = {};
  this.exercises.forEach((e) => (inputOptions[e.id] = e.name));

  Swal.fire({
    title: 'Elige un ejercicio',
    input: 'select',
    inputOptions: inputOptions,
    inputPlaceholder: '-- Elegir --',
    showCancelButton: true,
    confirmButtonText: 'Seleccionar',
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      this.selectedExerciseId = parseInt(result.value, 10);
      this.viewingHistory = false; // modo registro
      this.seriesInputs = [{ repetitions: null, weight: null }];
      this.numSeries = 1;

      // 👉 cargar historial automáticamente
      this.loadExerciseLogs(this.selectedExerciseId);
    }
  });
}

  loadExerciseLogs(exerciseId: number): void {
    this.trainingService.getExerciseLogs(this.userId, exerciseId).subscribe({
      next: (data) => {
        this.exerciseLogs = data.sort((a, b) => b.date.localeCompare(a.date));
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el historial de este ejercicio.',
        });
        this.exerciseLogs = [];
      },
    });
  }

  submitTraining(): void {
    if (!this.selectedExerciseId || !this.seriesInputs.length) return;

    this.loading = true;

    const today = new Date().toISOString().split('T')[0];

    this.trainingService
      .createExerciseLog(this.userId, this.selectedExerciseId, today)
      .subscribe({
        next: (res) => {
          const cleanedSeries: SeriesDetail[] = this.seriesInputs.map((s) => ({
            repetitions: s.repetitions ?? 0,
            weight:
              s.weight !== null && s.weight !== undefined ? s.weight : 0,
          }));

          this.trainingService
            .createSeriesDetails(res.exercise_log_id, cleanedSeries)
            .subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: '¡Éxito!',
                  text: 'Entrenamiento registrado con éxito.',
                  confirmButtonColor: '#3085d6',
                });

                this.seriesInputs = [{ repetitions: null, weight: null }];
                this.numSeries = 1;
                this.selectedExerciseId = null;
              },
              error: () => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Error al guardar las series.',
                  confirmButtonColor: '#d33',
                });
                this.loading = false;
              },
              complete: () => (this.loading = false),
            });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al guardar el log de ejercicio.',
            confirmButtonColor: '#d33',
          });
          this.loading = false;
        },
      });
  }

  getSelectedExerciseName(): string {
    const selected = this.exercises.find(
      (e) => e.id === this.selectedExerciseId
    );
    return selected ? selected.name : '';
  }
}
