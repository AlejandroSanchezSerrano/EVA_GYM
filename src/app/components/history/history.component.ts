import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-history',
  templateUrl: './history.component.html',
imports: [CommonModule, FormsModule],
})
export class HistoryComponent implements OnInit {
  isLoggedIn: boolean = false;
  userId: number | null = null;
  selectedDate: string = this.getTodayDate();
  exerciseLogs: any[] = [];
  loading: boolean = false;

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
      this.isLoggedIn = true;
      this.getLogsByDate();
    } else {
      this.isLoggedIn = false;
    }
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getLogsByDate(): void {
    if (!this.userId) return;

    this.loading = true;
    this.trainingService.getTodayLogs(this.userId, this.selectedDate).subscribe({
      next: (logs) => {
        this.exerciseLogs = logs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener logs:', err);
        this.exerciseLogs = [];
        this.loading = false;
      },
    });
  }

  onDateChange(): void {
    this.getLogsByDate();
  }
}
