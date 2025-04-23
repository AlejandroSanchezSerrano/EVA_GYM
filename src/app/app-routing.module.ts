import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/registro/registro.component';

const routes: Routes = [
  { path: 'registro', component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true })],
  exports: [RouterModule]         
})
export class AppRoutingModule {}
