import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width: 400px; margin: 2rem auto; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); background: #fff;">
      <h2 style="text-align:center; margin-bottom: 1.5rem;">User Profile</h2>
      <div *ngIf="user">
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Roles:</strong> <span *ngFor="let role of user.roles; let last = last">{{ role }}<span *ngIf="!last">, </span></span></p>
      </div>
      <div *ngIf="!user" style="text-align:center; color: #888;">Loading...</div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: any = null;

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    fetch(`http://localhost:8080/api/v1/users/${userId}`)
      .then(res => res.json())
      .then(data => this.user = data)
      .catch(() => this.user = null);
  }
}
