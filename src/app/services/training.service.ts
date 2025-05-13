import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Exercise {
  id: number;
  name: string;
  group: string;
}

export interface ExerciseLogResponse {
  success: boolean;
  exercise_log_id: number;
}

export interface SeriesDetail {
  repetitions: number | null;
  weight: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private apiUrl = 'https://ruizgijon.ddns.net/sancheza/evagym/controller';

  constructor(private http: HttpClient) {}

  // 🏋️ Obtener ejercicios
  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}/excercises.php`);
  }

  // 📝 Crear log de ejercicio
  createExerciseLog(
    userId: number,
    exerciseId: number,
    date: string
  ): Observable<ExerciseLogResponse> {
    const payload = {
      user_id: userId,
      exercise_id: exerciseId,
      date: date,
    };
    return this.http.post<ExerciseLogResponse>(
      `${this.apiUrl}/create_exercise_log.php`,
      payload
    );
  }

  // ➕ Crear series para un log
  createSeriesDetails(
    exerciseLogId: number,
    series: SeriesDetail[]
  ): Observable<any> {
    const payload = {
      exercise_log_id: exerciseLogId,
      series: series,
    };
    return this.http.post<any>(
      `${this.apiUrl}/create_series_details.php`,
      payload
    );
  }

  // 📜 Obtener historial de logs
  getExerciseLogs(userId: number, exerciseId: number): Observable<any[]> {
    if (userId == null || exerciseId == null) {
      throw new Error('userId y exerciseId son obligatorios');
    }

    const params = {
      user_id: userId.toString(),
      exercise_id: exerciseId.toString(),
    };

    return this.http.get<any[]>(`${this.apiUrl}/get_exercise_logs.php`, {
      params,
    });
  }

  // ❌ Eliminar un log completo
  deleteExerciseLog(logId: number): Observable<any> {
    if (logId == null) {
      throw new Error('logId es obligatorio');
    }

    return this.http.post<any>(`${this.apiUrl}/delete_exercise_log.php`, {
      log_id: logId,
    });
  }

  // 🔁 Eliminar series para editar (simulación de edición)
  deleteSeriesDetails(exerciseLogId: number): Observable<any> {
    if (exerciseLogId == null) {
      throw new Error('exerciseLogId es obligatorio');
    }

    return this.http.post<any>(`${this.apiUrl}/delete_series_details.php`, {
      exercise_log_id: exerciseLogId,
    });
  }

  // 📅 Obtener logs de todos los ejercicios de un día
  getTodayLogs(userId: number, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get_today_logs.php`, {
      params: {
        user_id: userId.toString(),
        date: date,
      },
    });
  }
}
