import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  imports: [CommonModule]
})
export class InicioComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  user_name: string | null = null;

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.user_name = this.storageService.getUserName();
    this.isUserLoggedIn = this.user_name !== null; 
  }
}