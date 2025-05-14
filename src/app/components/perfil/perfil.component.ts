import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { StorageService } from '../../services/storage.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PerfilComponent implements OnInit {
  user?: User;
  errorMessage: string = '';

  segmentos = [
    { texto: 'BAJO', cssClass: 'bajo' },
    { texto: 'NORMAL', cssClass: 'normal' },
    { texto: 'SOBREPESO', cssClass: 'sobrepeso' },
    { texto: 'OBESIDAD I', cssClass: 'obesidad1' },
    { texto: 'OBESIDAD II', cssClass: 'obesidad2' },
    { texto: 'OBESIDAD III', cssClass: 'obesidad3' }
  ];

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router
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
          this.router.navigate(['/login']);
        },
      });
    } else {
      this.errorMessage = 'No hay usuario identificado en localStorage.';
      this.router.navigate(['/login']);
    }
  }

  public calcularIMC(peso: number, altura: number): number {
    altura = altura / 100;
    return peso / (altura * altura);
  }

  getIMCRango(imc: number): { texto: string, min: number, max: number, cssClass: string } {
    if (imc < 18.5) {
      return { texto: 'Peso bajo', min: 10, max: 18.5, cssClass: 'bajo' };
    } else if (imc < 24.9) {
      return { texto: 'Peso normal', min: 18.5, max: 24.9, cssClass: 'normal' };
    } else if (imc < 29.9) {
      return { texto: 'Sobrepeso', min: 24.9, max: 29.9, cssClass: 'sobrepeso' };
    } else if (imc < 34.9) {
      return { texto: 'Obesidad I', min: 29.9, max: 34.9, cssClass: 'obesidad1' };
    } else if (imc < 39.9) {
      return { texto: 'Obesidad II', min: 34.9, max: 39.9, cssClass: 'obesidad2' };
    } else {
      return { texto: 'Obesidad III', min: 39.9, max: 45, cssClass: 'obesidad3' };
    }
  }

  getIMCPercent(peso: number, altura: number): number {
  const imc = this.calcularIMC(peso, altura);

  const rangos = [
    { min: 10, max: 18.5, inicio: 0 },       // Bajo peso (0% - 24%)
    { min: 18.5, max: 24.9, inicio: 24 },    // Normal (24% - 42%)
    { min: 24.9, max: 29.9, inicio: 42 },    // Sobrepeso (42% - 56%)
    { min: 29.9, max: 34.9, inicio: 56 },    // Obesidad I (56% - 70%)
    { min: 34.9, max: 39.9, inicio: 70 },    // Obesidad II (70% - 84%)
    { min: 39.9, max: 45, inicio: 84 }       // Obesidad III (84% - 100%)
  ];

  for (let r of rangos) {
    if (imc >= r.min && imc < r.max) {
      const proporcion = (imc - r.min) / (r.max - r.min);
      return r.inicio + proporcion * (100 / rangos.length);
    }
  }

  // Fuera de rango (muy bajo o muy alto)
  return imc < 10 ? 0 : 100;
}


  grasaCorporal(peso: number, altura: number, edad: number, genero: string): number {
    const imc = this.calcularIMC(peso, altura);
    const multi = genero === 'male' ? 1 : 2;
    return 1.2 * imc + 0.23 * edad - 10.8 * multi - 5.4;
  }

  actividad(actividad: string): string {
    switch (actividad) {
      case 'sedentary':
        return 'Sedentario';
      case 'light':
        return 'Ligero';
      case 'moderate':
        return 'Moderado';
      case 'intense':
        return 'Activo';
      default:
        return 'Muy Activo';
    }
  }

  cerrarSesion(): void {
    localStorage.clear();
    Swal.fire({
      title: '¡Sesión cerrada!',
      text: 'Has cerrado sesión correctamente.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn btn-primary',
      },
      buttonsStyling: false,
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  eliminarCuenta(): void {
    const userIdString = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name');

    if (userIdString && userName) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success mx-1',
          cancelButton: 'btn btn-danger mx-1',
        },
        buttonsStyling: false,
      });

      swalWithBootstrapButtons
        .fire({
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
              Swal.showValidationMessage(`Debes escribir exactamente: Eliminar ${userName}`);
            }
            return inputValue;
          },
        })
        .then((result) => {
          if (result.isConfirmed && result.value === `Eliminar ${userName}`) {
            const userId = Number(userIdString);

            this.userService.deleteUser(userId).subscribe({
              next: () => {
                localStorage.clear();
                Swal.fire('¡Eliminado!', 'Tu cuenta ha sido eliminada.', 'success').then(() => {
                  this.router.navigate(['/login']);
                });
              },
              error: (error) => {
                console.error('Error eliminando usuario:', error);
                Swal.fire('Error', 'Hubo un problema eliminando tu cuenta.', 'error');
              },
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire('Cancelado', 'Tu cuenta está segura 🙂', 'error');
          }
        });
    } else {
      console.error('No hay ID o nombre de usuario en localStorage.');
    }
  }

  editarPerfil(): void {
    this.router.navigate(['/edit']);
  }
}
