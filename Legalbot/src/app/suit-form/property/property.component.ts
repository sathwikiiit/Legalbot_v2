import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-property',
    imports: [ReactiveFormsModule, FormsModule, CommonModule],
    templateUrl: './property.component.html',
    styleUrl: './property.component.css'
})
export class PropertyComponent{
  @Input() property!:FormGroup<{
    type:FormControl,
    value:FormControl,
    extent:FormControl
  }>;
  @Input() id!:number
  @Output() e=new EventEmitter()
  constructor(){
  }
  remove(id:number) {
    this.e.emit()
  }
}
