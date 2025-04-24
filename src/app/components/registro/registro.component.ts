import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  imports: [FormsModule]
})
export class RegisterComponent {
  user: User = {
    name: '',
    age: 0,
    weight: 0,
    height: 0,
    gender: '',
    activity_level: '',
    goal: '',
    daily_calories: 0,
    passwd: ''
  };

  constructor(private userService: UserService, private router: Router  ) { }

  calculateCalories(): void {
    let tmb: number;
    if (this.user.gender === 'male') {
      tmb = (10 * this.user.weight) + (6.25 * this.user.height) - (5 * this.user.age) + 5;
    } else {
      tmb = (10 * this.user.weight) + (6.25 * this.user.height) - (5 * this.user.age) - 161;
    }

    const activityMultipliers: { [key: string]: number } = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'intense': 1.75,
      'athlete': 1.9
    };

    this.user.daily_calories = tmb * (activityMultipliers[this.user.activity_level] || 1.2);

    if (this.user.goal === 'deficit') {
      this.user.daily_calories -= 500;
    } else if (this.user.goal === 'surplus') {
      this.user.daily_calories += 500;
    }
  }

  onSubmit(): void {
    this.calculateCalories();
    this.userService.createUser(this.user).subscribe(
      response => {
        console.log('User created successfully:', response);
        this.router.navigate(['/login']); // Redirigir al perfil
      },
      error => {
        console.error('Error creating user:', error);
        alert('Hubo un error al registrar el usuario. Inténtalo de nuevo.');
      }
    );
  }
  
}
