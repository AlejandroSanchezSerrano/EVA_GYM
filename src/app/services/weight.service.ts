import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeightService {
  private apiUrl = 'https://ruizgijon.ddns.net/sancheza/evagym/controller/weight_controller.php'; 

  constructor(private http: HttpClient) {}

  createWeight(weight: number, date: string, id_user: number): Observable<any> {
    return this.http.post(this.apiUrl, {
      action: 'create',
      weight,
      date,
      id_user
    });
  }

  updateWeight(id: number, weight: number, date: string): Observable<any> {
    return this.http.post(this.apiUrl, {
      action: 'update',
      id,
      weight,
      date
    });
  }

  deleteWeight(id: number): Observable<any> {
    return this.http.post(this.apiUrl, {
      action: 'delete',
      id
    });
  }

  getWeightsByUser(id_user: number): Observable<any> {
    return this.http.post(this.apiUrl, {
      action: 'getByUserId',
      id_user
    });
  }  
}
