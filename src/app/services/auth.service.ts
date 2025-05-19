import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adminStatus = new BehaviorSubject<boolean>(this.checkAdmin());

  constructor() {}

  // Emitir si es admin
  isAdmin$ = this.adminStatus.asObservable();

  // Verifica si el usuario actual es admin
  private checkAdmin(): boolean {
    return localStorage.getItem('user_name') === 'admin';
  }

  // Llamar esto al iniciar sesión
  login(userName: string): void {
    localStorage.setItem('user_name', userName);
    this.adminStatus.next(this.checkAdmin());
  }

  // Llamar esto al cerrar sesión
  logout(): void {
    localStorage.removeItem('user_name');
    this.adminStatus.next(false);
  }
}
