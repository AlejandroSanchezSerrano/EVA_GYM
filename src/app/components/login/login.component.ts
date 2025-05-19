import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  credentials = {
    name: '',
    passwd: '',
  };

  errorMessage = '';
  rememberMe = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.getCookie('rememberedUser');
    const pass = this.getCookie('rememberedPass');

    if (user && pass) {
      this.credentials.name = user;
      this.credentials.passwd = atob(pass); // decodifica base64
      this.rememberMe = true;
    }
  }

  // Función auxiliar
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  onSubmit(): void {
    this.userService.login(this.credentials).subscribe(
      (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('user_id', response.user_id);
        localStorage.setItem('user_name', response.name);

        //Cookies
        if (this.rememberMe) {
          // Guardar cookie por 30 días
          const days = 30;
          const expires = new Date(Date.now() + days * 86400000).toUTCString();
          document.cookie = `rememberedUser=${response.name}; expires=${expires}; path=/`;
          document.cookie = `rememberedPass=${btoa(
            this.credentials.passwd
          )}; expires=${expires}; path=/`;
        } else {
          // Eliminar la cookie si existía
          document.cookie =
            'rememberedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
          document.cookie =
            'rememberedPass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        }

        // Mostrar alerta de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola ${response.name}, has iniciado sesión correctamente.`,
          confirmButtonText: 'Continuar',
        }).then(() => {
          // Redirigir después de cerrar el Swal
          this.authService.login(response.name);
          this.router.navigate(['/perfil']);
        });
      },
      (error) => {
        console.error('Login failed:', error);
        this.errorMessage =
          'Usuario o contraseña incorrectos. Inténtalo nuevamente.';
      }
    );
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }
}
