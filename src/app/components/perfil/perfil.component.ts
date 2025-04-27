import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { StorageService } from '../../services/storage.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; // ¡Asegúrate de importar!

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
    // localStorage.removeItem('user_id');
    // localStorage.removeItem('user_name');
    localStorage.clear();
  
    Swal.fire({
      title: '¡Sesión cerrada!',
      text: 'Has cerrado sesión correctamente.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn btn-primary'
      },
      buttonsStyling: false
    }).then(() => {
      this.router.navigate(['/login']); // Redirigir al login después de OK
    });
  }

  eliminarCuenta() {
    const userIdString = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name');
  
    if (userIdString !== null && userName !== null) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success mx-1',
          cancelButton: 'btn btn-danger mx-1'
        },
        buttonsStyling: false
      });
  
      swalWithBootstrapButtons.fire({
        title: '¿Estás seguro?',
        text: `Esta acción eliminará tu cuenta (${userName}) permanentemente.`,
        icon: 'warning',
        input: 'text',
        inputPlaceholder: `Escribe: Eliminar ${userName}`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        preConfirm: (inputValue) => {
          if (inputValue !== `Eliminar ${userName}`) {
            Swal.showValidationMessage(
              `Debes escribir exactamente: Eliminar ${userName}`
            );
          }
          return inputValue;
        }
      }).then((result) => {
        if (result.isConfirmed && result.value === `Eliminar ${userName}`) {
          const userId = Number(userIdString);
  
          this.userService.deleteUser(userId).subscribe({
            next: (response) => {
              console.log('Usuario eliminado:', response);
              Swal.fire('¡Eliminado!', 'Tu cuenta ha sido eliminada.', 'success').then(() => {
                this.router.navigate(['/login']);
              });
            },
            error: (error) => {
              console.error('Error eliminando usuario:', error);
              Swal.fire('Error', 'Hubo un problema eliminando tu cuenta.', 'error');
            }
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            'Cancelado',
            'Tu cuenta está segura 🙂',
            'error'
          );
        }
      });
  
    } else {
      console.error('No hay ID o nombre de usuario en localStorage.');
    }
  }
  
  editarPerfil() {
    this.router.navigate(['/edit']);
  }
}