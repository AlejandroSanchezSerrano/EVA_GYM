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
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Peso/Peso1.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Peso/Peso2.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Peso/Peso3.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Peso/Peso4.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Peso/Peso5.png',
      ],
      calorias: [
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Caloria/Caloria1.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Caloria/Caloria2.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Caloria/Caloria3.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Caloria/Caloria4.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Caloria/Caloria5.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Caloria/Caloria6.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Caloria/Caloria7.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Caloria/Caloria8.png',
      ],
      ejercicios: [
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio1.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio2.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio3.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio4.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio5.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio6.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio9.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio7.png',
        'https://ruizgijon.ddns.net/sancheza/img/EVAGYM/Ejercicio/Ejercicio8.png',

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
