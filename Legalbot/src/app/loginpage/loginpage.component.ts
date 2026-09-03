import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-loginpage',
  imports: [CommonModule, FormsModule],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.css',
  animations: [
    trigger('buttonState', [
      state('normal', style({ opacity: '1' })),
      state('loading', style({ opacity: '0.5' })),
      transition('normal => loading', animate('300ms ease-in')),
      transition('loading => normal', animate('300ms ease-out'))
    ])
  ]
})
export class LoginpageComponent implements OnInit {
  Username: string = "";
  password: any = "";
  isauth: boolean = false;
  check: boolean = true;
  isLoading: boolean = false;

  constructor(private routr: Router, protected auth: LoginService) {}

  ngOnInit(): void {}

  Login(event: Event) {
    event.preventDefault();
    this.isLoading = true;
    this.check = true;

    const verifyCreds = () => {
      const userKey = this.Username.trim();
      if (this.auth.creds.has(userKey) && this.auth.creds.get(userKey) === this.password) {
        this.auth.authenticated(userKey);
        this.isLoading = false;
        this.routr.navigate(['/dashboard']);
      } else {
        this.check = false;
        this.isLoading = false;
      }
    };

    this.auth.Login().subscribe({
      next: () => verifyCreds(),
      error: (err: any) => {
        console.warn('Backend /auth warning/error, falling back to credentials validation:', err);
        verifyCreds();
      }
    });
  }
}