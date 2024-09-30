import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FetcherService } from './fetcher.service';

@Injectable({
  providedIn: 'root'
})

export class LoginService {
  public isLoggedIn = new BehaviorSubject<boolean>(false);
  creds: Map<String, String>;

  constructor(private http: HttpClient, private fetcher:FetcherService) {
    this.creds= new Map<String,String>()
    this.creds.set('Sathwik','Vidya123');
    this.creds.set('sathwik',' ');
    
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  Login():Observable<Object>{
    return this.fetcher.auth()
    }

  logout(): void {
    this.isLoggedIn.next(false);
  }

  authenticated(user:string) {
    this.fetcher.user=user
    this.isLoggedIn.next(true);
  }
}