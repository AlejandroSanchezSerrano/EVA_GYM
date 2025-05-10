import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Exercise {
  id: number;
  name: string;
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
  providedIn: 'root'
})
export class TrainingService {

  private apiUrl = 'https://ruizgijon.ddns.net/sancheza/evagym/controller'; 

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de ejercicios disponibles
   */
  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}/excercises.php`);
  }

  /**
   * Crea un registro de entrenamiento (log) para un usuario y ejercicio en una fecha
   */
  createExerciseLog(userId: number, exerciseId: number, date: string): Observable<ExerciseLogResponse> {
    const payload = {
      user_id: userId,
      exercise_id: exerciseId,
      date: date
    };
    return this.http.post<ExerciseLogResponse>(`${this.apiUrl}/create_exercise_log.php`, payload);
  }

  /**
   * Registra los detalles de las series (repeticiones y peso) para un log de ejercicio
   */
  createSeriesDetails(exerciseLogId: number, series: SeriesDetail[]): Observable<any> {
    const payload = {
      exercise_log_id: exerciseLogId,
      series: series
    };
    return this.http.post<any>(`${this.apiUrl}/create_series_details.php`, payload);
  }
  
  getExerciseLogs(userId: number, exerciseId: number): Observable<any[]> {
  const params = { user_id: userId.toString(), exercise_id: exerciseId.toString() };
  return this.http.get<any[]>(`${this.apiUrl}/get_exercise_logs.php`, { params });
}

}
