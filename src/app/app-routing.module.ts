import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/registro/registro.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { Error404Component } from './components/error404/error404.component';
import { EditComponent } from './components/edit/edit.component';
import { AcercaComponent } from './components/acerca/acerca.component';
import { WeightComponent } from './components/weight/weight.component';
import { CalorieComponent } from './components/calorie/calorie.component';
import { TrainingComponent } from './components/training/training.component';
import { HistoryComponent } from './components/history/history.component';
import { AdminComponent } from './components/admin/admin.component';

const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'edit', component: EditComponent },
  { path: 'acerca', component: AcercaComponent },
  { path: 'peso', component: WeightComponent },
  { path: 'calorias', component: CalorieComponent },
  { path: 'ejercicios', component: TrainingComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', component: Error404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true })],
  exports: [RouterModule]         
})
export class AppRoutingModule {}
