import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PropertyFormControls } from '../../suit';

@Component({
    selector: 'app-property',
    imports: [ReactiveFormsModule, FormsModule, CommonModule],
    templateUrl: './property.component.html',
    styleUrl: './property.component.css'
})
export class PropertyComponent{
  @Input() property!:FormGroup<PropertyFormControls>
  @Input() id!:number
  @Output() e=new EventEmitter()
  constructor(){
  }
  remove(id:number) {
    this.e.emit(this.id-1)
  }
}
