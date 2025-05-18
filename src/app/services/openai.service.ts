import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  private readonly backendUrl = 'https://ruizgijon.ddns.net/sancheza/evagym/controller/openai.php'; 

  constructor(private http: HttpClient) {}

  estimateCalories(userInput: string) {
    return this.http.post<any>(this.backendUrl, { userInput });
  }
}
