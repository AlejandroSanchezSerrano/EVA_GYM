import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; 

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
        localStorage.setItem('user_id', response.user_id);
        localStorage.setItem('user_name', response.name );

        // Mostrar alerta de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola ${response.name}, has iniciado sesión correctamente.`,
          confirmButtonText: 'Continuar'
        }).then(() => {
          // Redirigir después de cerrar el Swal
          this.router.navigate(['/perfil']);
        });
      },
      error => {
        console.error('Login failed:', error);
        this.errorMessage = 'Usuario o contraseña incorrectos. Inténtalo nuevamente.';
      }
    );
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }
}
