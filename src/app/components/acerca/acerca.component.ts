import { Component, OnInit } from '@angular/core';
import { GithubService } from '../../services/github.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acerca',
  templateUrl: './acerca.component.html',
  styleUrls: ['./acerca.component.css'],
  imports: [CommonModule]
})
export class AcercaComponent implements OnInit {
  commits: any[] = [];

  constructor(private githubService: GithubService) { }

  ngOnInit() {
    this.githubService.getCommits().subscribe(data => {
      this.commits = data.slice(0,10); // Mostrar los últimos 5 commits
    });
  }
}
