import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  setUserName(userName: string): void {
    localStorage.setItem('userName', userName);
  }

  clearUserData(): void {
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
  }
}