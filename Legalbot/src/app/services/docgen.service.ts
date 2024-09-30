import { Injectable } from '@angular/core';
import { SuitGen } from '../dox/suit-gen';


@Injectable({
  providedIn: 'root'
})
export class DocgenService {
  filehandler: SuitGen;
  constructor(){
    this.filehandler=new SuitGen()
  }
}
