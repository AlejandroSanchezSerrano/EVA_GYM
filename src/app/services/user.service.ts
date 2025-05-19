import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://ruizgijon.ddns.net/sancheza/evagym';

  constructor(private http: HttpClient) {}

  createUser(user: User): Observable<any> {
    console.log('Enviando usuario:', user);
    return this.http.post(
      `${this.apiUrl}/controller/create.php`,
      user,
      httpOptions
    );
  }

  login(credentials: { name: string; passwd: string }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/controller/login.php`,
      credentials
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}/controller/getUser.php`,
      { id },
      httpOptions
    );
  }

  // deleteUser(id: number): Observable<any> {
  //   return this.http.post<any>(
  //     `${this.apiUrl}/controller/deleteUser.php`,
  //     { id },
  //     httpOptions
  //   );
  // }

  deleteUser(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/controller/user_controller.php`, {
      action: 'deleteUser',
      id: id,
    });
  }

  // updateUser(user: User): Observable<any> {
  //   console.log("Enviando actualización de usuario:", user);
  //   return this.http.post<any>(`${this.apiUrl}/controller/updateUser.php`, user, httpOptions);
  // }

  updateUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/controller/user_controller.php`, {
      action: 'updateUser',
      ...user,
    });
  }
}
