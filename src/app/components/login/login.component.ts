import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  credentials = {
    name: '',
    passwd: ''
  };

  errorMessage = '';

  constructor(private userService: UserService, private router: Router) {}

  onSubmit(): void {
    this.userService.login(this.credentials).subscribe(
      response => {
        console.log('Login successful:', response);
        // Guardar el token o ID del usuario en localStorage o sessionStorage
        localStorage.setItem('user_id', response.user_id);
        // Redirigir al usuario a la página de perfil u otra página protegida
        this.router.navigate(['/perfil']);
      },
      error => {
        console.error('Login failed:', error);
        this.errorMessage = 'Usuario o contraseña incorrectos. Inténtalo nuevamente.';
      }
    );
  }
}