import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { StorageService } from '../../services/storage.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  imports: [CommonModule]
})
export class PerfilComponent implements OnInit {
  user?: User;
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router // Inyecta el servicio Router
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.userService.getUserById(Number(userId)).subscribe({
        next: (data) => {
          this.user = data;
        },
        error: (err) => {
          this.errorMessage = 'No se pudieron obtener los datos del usuario.';
          console.error(err);
          this.router.navigate(['/login']); // Redirige en caso de error
        }
      });
    } else {
      this.errorMessage = 'No hay usuario identificado en localStorage.';
      this.router.navigate(['/login']); // Redirige si no hay user_id
    }
  }

  cerrarSesion() {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    window.location.reload();
  }

  eliminarCuenta() {
    const userIdString = localStorage.getItem('user_id');
  
    if (userIdString !== null) {
      const userId = Number(userIdString);
  
      this.userService.deleteUser(userId).subscribe({
        next: (response) => {
          console.log('Usuario eliminado:', response);
          window.location.reload();
        },
        error: (error) => {
          console.error('Error eliminando usuario:', error);
        }
      });
    } else {
      console.error('No hay ID de usuario en localStorage.');
    }
  }
  
}