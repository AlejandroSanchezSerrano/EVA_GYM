import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private repoUrl = 'https://api.github.com/repos/AlejandroSanchezSerrano/EVA_GYM/commits';

  constructor(private http: HttpClient) { }

  getCommits(): Observable<any> {
    return this.http.get<any>(this.repoUrl);
  }
}
