import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class EditComponent implements OnInit {
  userForm!: FormGroup;
  user?: User;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.userService.getUserById(Number(userId)).subscribe({
        next: (data) => {
          this.user = data;
          this.createForm();
          this.setupAutoCalculation(); 
        },
        error: (err) => {
          this.errorMessage = 'No se pudieron obtener los datos del usuario.';
          console.error(err);
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.errorMessage = 'No hay usuario identificado en localStorage.';
      this.router.navigate(['/login']);
    }
  }

  createForm() {
    this.userForm = this.fb.group({
      name: [this.user?.name, Validators.required],
      age: [this.user?.age, [Validators.required, Validators.min(0)]],
      weight: [this.user?.weight, [Validators.required, Validators.min(0)]],
      height: [this.user?.height, [Validators.required, Validators.min(0)]],
      gender: [this.user?.gender, Validators.required],
      activity_level: [this.user?.activity_level, Validators.required],
      goal: [this.user?.goal, Validators.required],
      daily_calories: [{ value: this.user?.daily_calories, disabled: true }, [Validators.required, Validators.min(0)]]
    });
  }

  setupAutoCalculation(): void {
    this.userForm.valueChanges.subscribe(() => {
      this.calculateCalories();
    });
  }

  calculateCalories(): void {
    const weight = this.userForm.get('weight')?.value;
    const height = this.userForm.get('height')?.value;
    const age = this.userForm.get('age')?.value;
    const gender = this.userForm.get('gender')?.value;
    const activity_level = this.userForm.get('activity_level')?.value;
    const goal = this.userForm.get('goal')?.value;

    if (weight && height && age && gender && activity_level && goal) {
      let tmb: number;

      if (gender === 'male') {
        tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }

      const activityMultipliers: { [key: string]: number } = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'intense': 1.75,
        'athlete': 1.9
      };

      let dailyCalories = tmb * (activityMultipliers[activity_level] || 1.2);

      if (goal === 'deficit') {
        dailyCalories -= 500;
      } else if (goal === 'surplus') {
        dailyCalories += 500;
      }

      this.userForm.patchValue(
        { daily_calories: Math.round(dailyCalories) },
        { emitEvent: false } //  Esto evita el bucle infinito
      );
    }
  }

  onSubmit() {
    if (this.userForm.valid && this.user) {
      const updatedUser: User = { 
        ...this.user, 
        ...this.userForm.getRawValue() // getRawValue() porque 'daily_calories' está deshabilitado
      };
      this.userService.updateUser(updatedUser).subscribe({
        next: (response) => {
          console.log('Usuario actualizado:', response);
          this.router.navigate(['/perfil']); // Redirige después de actualizar
        },
        error: (error) => {
          console.error('Error actualizando usuario:', error);
        }
      });
    } else {
      console.error('Formulario inválido o usuario no definido');
    }
  }
}
