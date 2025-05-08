import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalorieService {
  private calorieApiUrl = 'https://ruizgijon.ddns.net/sancheza/evagym/controller/calorie_controller.php';
  private userApiUrl = 'https://ruizgijon.ddns.net/sancheza/evagym/controller/user_controller.php';

  constructor(private http: HttpClient) {}

  createCalorie(user_id: number, calories_consumed: number, date: string): Observable<any> {
    return this.http.post(this.calorieApiUrl, {
      action: 'create',
      user_id,
      calories_consumed,
      date
    });
  }

  updateCalorie(id: number, calories_consumed: number, date: string): Observable<any> {
    return this.http.post(this.calorieApiUrl, {
      action: 'update',
      id,
      calories_consumed,
      date
    });
  }

  deleteCalorie(id: number): Observable<any> {
    return this.http.post(this.calorieApiUrl, {
      action: 'delete',
      id
    });
  }

  getCaloriesByUser(user_id: number): Observable<any> {
    return this.http.post(this.calorieApiUrl, {
      action: 'getByUserId',
      user_id
    });
  }

  getDailyCalories(user_id: number): Observable<any> {
    return this.http.post(this.userApiUrl, {
      action: 'getDailyCalories',
      user_id
    });
  }
}
