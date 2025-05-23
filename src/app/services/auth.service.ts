import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adminStatus = new BehaviorSubject<boolean>(this.checkAdmin());
  private loggedStatus = new BehaviorSubject<boolean>(this.checkLog());

  constructor() {}

  // Observable para saber si es admin
  isAdmin$ = this.adminStatus.asObservable();

  // Observable para saber si hay sesión iniciada
  isLogged$ = this.loggedStatus.asObservable();

  // Verifica si el usuario actual es admin
  private checkAdmin(): boolean {
    return localStorage.getItem('user_name') === 'admin';
  }

  // Verifica si hay un usuario logueado
  checkLog(): boolean {
    return localStorage.getItem('user_name') !== null;
  }

  // Llamar esto al iniciar sesión
  login(userName: string): void {
    localStorage.setItem('user_name', userName);
    this.adminStatus.next(this.checkAdmin());
    this.loggedStatus.next(this.checkLog());
  }

  // Llamar esto al cerrar sesión
  logout(): void {
    localStorage.removeItem('user_name');
    this.adminStatus.next(false);
    this.loggedStatus.next(false);
  }
}
