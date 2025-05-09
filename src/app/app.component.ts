import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'EVA GYM';
  correo = 'alexxsanse@gmail.com';

  getPerfilLink(): string {
    return localStorage.getItem('user_name') ? '/perfil' : '/login';
  }
  
}
