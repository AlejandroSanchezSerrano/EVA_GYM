import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exercise {
  id: number;
  name: string;
  group: string;
}

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private apiUrl =
    'https://ruizgijon.ddns.net/sancheza/evagym/controller/exercise_controller.php';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}?action=getAll`);
  }

  create(name: string, group: string): Observable<any> {
    return this.http.post(this.apiUrl, { action: 'create', name, group });
  }

  update(exercise: Exercise): Observable<any> {
    return this.http.post(this.apiUrl, {
      action: 'update',
      ...exercise,
    });
  }

  delete(id: number): Observable<any> {
    return this.http.post(this.apiUrl, { action: 'delete', id });
  }

  getPagedExercises(
    page: number,
    limit: number
  ): Observable<{ exercises: Exercise[]; total: number }> {
    return this.http.post<{ exercises: Exercise[]; total: number }>(
      this.apiUrl,
      {
        action: 'getPaged',
        page: page,
        limit: limit,
      }
    );
  }
}
