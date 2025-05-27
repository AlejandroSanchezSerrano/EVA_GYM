import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  imports: [CommonModule],
})
export class InicioComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  user_name: string | null = null;

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit(): void {
    this.user_name = this.storageService.getUserName();
    this.isUserLoggedIn = this.user_name !== null;
  }

  irPesos() {
    this.router.navigate(['/peso']);
  }

  irCalorias() {
    this.router.navigate(['/calorias']);
  }

  irEjercicios() {
    this.router.navigate(['/ejercicios']);
  }

  irAbout() {
    this.router.navigate(['/acerca']);
  }

  scrollToSection() {
    const section = document.getElementById('contenidoPrincipal');
    section?.scrollIntoView({ behavior: 'smooth' });
  }

  mostrarTutorial(tipo: string) {
    const imagenes: { [clave: string]: string[] } = {
      pesos: [
        'https://via.placeholder.com/400x200?text=Peso+1',
        'https://via.placeholder.com/400x200?text=Peso+2',
        'https://via.placeholder.com/400x200?text=Peso+3',
      ],
      calorias: [
        'https://via.placeholder.com/400x200?text=Calorias+1',
        'https://via.placeholder.com/400x200?text=Calorias+2',
        'https://via.placeholder.com/400x200?text=Calorias+3',
        'https://via.placeholder.com/400x200?text=Calorias+4',
      ],
      ejercicios: ['https://via.placeholder.com/400x200?text=Ejercicios+1'],
      about: [
        'https://via.placeholder.com/400x200?text=Nosotros+1',
        'https://via.placeholder.com/400x200?text=Nosotros+2',
        'https://via.placeholder.com/400x200?text=Nosotros+3',
        'https://via.placeholder.com/400x200?text=Nosotros+4',
        'https://via.placeholder.com/400x200?text=Nosotros+5',
      ],
    };

    let index = 0;
    const imgs = imagenes[tipo];

    const actualizarContenido = () => {
      const img = document.getElementById('swal-img') as HTMLImageElement;
      const prevBtn = document.getElementById('prev-btn') as HTMLElement;
      const nextBtn = document.getElementById('next-btn') as HTMLElement;

      if (img) img.src = imgs[index];
      if (prevBtn) prevBtn.style.display = index > 0 ? 'inline-block' : 'none';
      if (nextBtn)
        nextBtn.style.display =
          index < imgs.length - 1 ? 'inline-block' : 'none';
    };

    Swal.fire({
      title: 'Tutorial',
      html: `
      <div style="display:flex;flex-direction:column;align-items:center">
        <img id="swal-img" src="${imgs[0]}" style="max-width:100%;height:auto;margin-bottom:10px" />
        <div>
          <button id="prev-btn" class="swal2-confirm swal2-styled" style="margin-right:10px">Anterior</button>
          <button id="next-btn" class="swal2-confirm swal2-styled">Siguiente</button>
        </div>
      </div>
    `,
      showCancelButton: true,
      cancelButtonText: 'Salir',
      showConfirmButton: false,
      didOpen: () => {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        prevBtn?.addEventListener('click', () => {
          if (index > 0) {
            index--;
            actualizarContenido();
          }
        });

        nextBtn?.addEventListener('click', () => {
          if (index < imgs.length - 1) {
            index++;
            actualizarContenido();
          }
        });

        // Oculta botones si es necesario al inicio
        actualizarContenido();
      },
    });
  }
}
