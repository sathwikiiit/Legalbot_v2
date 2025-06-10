import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Suit, SuitDto } from '../suit';

@Injectable({
  providedIn: 'root'
})
export class FetcherService {
  api_url: string;
  user!: string;
  private change=new BehaviorSubject<boolean>(false);
  change$=this.change.asObservable()
  constructor(private client:HttpClient) {
    this.api_url=""
  }

  public setuser(user:string) {
    this.user=user;
  }

  public postsuit(suit: any):Observable<any> {
    return this.client.post(this.api_url+"insert",suit);
  }

  auth() {
    return this.client.get(this.api_url+"auth");
  }

  public fetchsuits():Observable<any> {
    return this.client.get(this.api_url+"suits");
  }
  
  public fetchsuitsbyuser(user:string):Observable<any> {
    return this.client.get<Suit[]>(this.api_url+"user?name="+user);
  }
  
  public fetchsuitbyid(id:number):Observable<SuitDto>{
    return this.client.get<any>(this.api_url+"suitById?id="+id);
  }
  
  getchange(){
    return this.change.getValue()
  }
  
  changed() {
    this.change.next(!this.change.getValue())
  }

  submitSuit(suit: any): Observable<any> {
    return this.client.post(
      this.api_url+'save',
      suit,
      { headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
  }
}
