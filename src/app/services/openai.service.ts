import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly apiKey = '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';

  constructor(private http: HttpClient) {}

  estimateCalories(userInput: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-4o', // o 'gpt-3.5-turbo' si prefieres ahorrar
      messages: [
        {
          role: 'system',
          content:
            'Eres un nutricionista. Tu tarea es estimar la cantidad total de calorías de una comida diaria completa descrita por el usuario. Devuelve solo el número estimado en kcal, solo el numero estimado, de esta forma "Total: [kcals]"',
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      temperature: 0.2,
    };

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
