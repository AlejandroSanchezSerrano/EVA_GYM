import { Component, OnInit } from '@angular/core';
import { GithubService } from '../../services/github.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-acerca',
  templateUrl: './acerca.component.html',
  styleUrls: ['./acerca.component.css'],
  imports: [CommonModule, DatePipe]
})
export class AcercaComponent implements OnInit {
  commits: any[] = [];
  mostrarSidebar: boolean = false;

  constructor(private githubService: GithubService, private router: Router) {}

  ngOnInit() {
    this.githubService.getCommits().subscribe(data => {
      this.commits = data.slice(0, 15);
    });
  }

  irAInicio() {
    this.router.navigate(['/inicio']);
  }

  toggleSidebar() {
    this.mostrarSidebar = !this.mostrarSidebar;
  }
}
