import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'EVA GYM';
  correo = 'alexxsanse@gmail.com';
  isAdmin: boolean = false;
  registrado: boolean = false;

  constructor(private authService: AuthService) {}

  showDropdown = false;

  ngOnInit(): void {
    // Suscripción al estado de admin
    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    // Suscripción al estado de sesión
    this.authService.isLogged$.subscribe(isLogged => {
      this.registrado = isLogged;
    });
  }

  getPerfilLink(): string {
    return this.registrado ? '/perfil' : '/login';
  }
}
