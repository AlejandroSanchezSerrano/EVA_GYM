import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  getUserName(): string | null {
    return localStorage.getItem('user_name');
  }

  clearUserData(): void {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
  }
}