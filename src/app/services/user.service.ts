import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://ruizgijon.ddns.net/sancheza/api/evagym'; 

  constructor(private http: HttpClient) { }

  createUser(user: User): Observable<any> {
    console.log("Enviando usuario:", user);
    return this.http.post(`${this.apiUrl}/create.php`, user, httpOptions);
  }

  login(credentials: { name: string; passwd: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login.php`, credentials);
  }
}