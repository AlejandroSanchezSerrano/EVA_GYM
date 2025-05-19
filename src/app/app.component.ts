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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  getPerfilLink(): string {
    return localStorage.getItem('user_name') ? '/perfil' : '/login';
  }
}
