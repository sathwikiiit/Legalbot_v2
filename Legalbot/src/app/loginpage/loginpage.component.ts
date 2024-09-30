import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';
import { LoginService } from '../services/login.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-loginpage',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.css',
  animations: [
    trigger('buttonState', [
      state('normal', style({
        'opacity': '1',
      })),
      state('loading', style({
        'opacity': '0.5',
      })),
      transition('normal => loading', animate('300ms ease-in')),
      transition('loading => normal', animate('300ms ease-out'))
    ])
  ]
})
export class LoginpageComponent implements OnInit {
  Username: string="";
  password: any;
  isauth:boolean=false;
  check: boolean=true;
  isLoading:boolean=false;
  constructor(private routr:Router,protected auth:LoginService){    
  }
  ngOnInit(): void {
  }
  Login(event:Event) {
    event.preventDefault();
    this.isLoading=true
    const auther=this.auth.Login()
    .subscribe({
      next:(val)=>{
        if (this.auth.creds.has(this.Username)) {
          if (this.auth.creds.get(this.Username)==this.password) {
            this.auth.authenticated(this.Username)
            auther.unsubscribe()
            this.isLoading=false
            this.routr.navigate(['/dashboard'])
          }
          else{
            this.check=false
            auther.unsubscribe()
            this.isLoading=false
          }
        } else {
          this.check=false
          auther.unsubscribe()
          this.isLoading=false
        }
      },
      error:((err: any)=>{this.check=false;this.isLoading=false}),
    })
  }
}