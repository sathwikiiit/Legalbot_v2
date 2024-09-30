import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FetcherService } from '../services/fetcher.service';
import { Suit } from '../suit';
import { PropertyComponent } from './property/property.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suit-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, PropertyComponent,CommonModule],
  templateUrl: './suit-form.component.html',
  styleUrl: './suit-form.component.css',
})
export class SuitFormComponent implements OnInit {
  @Input()
  id!: number | undefined;
  suit: Suit = new Suit();
  formdata: FormGroup<{
    suitType: FormControl<string | null>; court: FormControl<string | null>; city: FormControl<string | null>; counselDetails: FormControl<string | null>; // Optional field, no validation
    plaintiff1: FormControl<string | null>; defendant1: FormControl<string | null>; plaintiffs: FormControl<string | null>; defendants: FormControl<string | null>; property: FormArray<FormGroup<{ type: FormControl<string | null>; value: FormControl<string | null>; extent: FormControl<string | null>; }>>;
  }>;
  properties!: FormArray<any>;
  constructor(
    private fetcher: FetcherService,
    private routr: Router,
    private fb: FormBuilder
  ) {
    this.formdata = new FormGroup({
      suitType: new FormControl('', Validators.required),
      court: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      counselDetails: new FormControl(''), // Optional field, no validation
      plaintiff1:new FormControl('', Validators.required),
      defendant1: new FormControl('', Validators.required),
      plaintiffs: new FormControl(''),
      defendants: new FormControl(''),
      property: new FormArray<FormGroup>([
        new FormGroup({
          type: new FormControl('', Validators.required),
          value:new FormControl(''),
          extent:new FormControl(''),
          syn:new FormControl(''),
          hn:new FormControl(''),
          plotNo:new FormControl('')  
        }),
      ]),
    });
  }
  ngOnInit(): void {
  }
  submited() {
    this.formdata.updateValueAndValidity()
    if (this.formdata.valid){
      this.fetcher.postsuit(this.formdata.getRawValue()).forEach(val=>{console.log(val)})
      this.fetcher.changed()
      this.routr.navigate(['/dashboard'])
    }
    else{
      console.log(this.formdata.errors)
    }
  }
  addProperty() {
    this.properties=this.formdata.controls.property as FormArray
    this.properties.push(
      new FormGroup({
        type: new FormControl('', Validators.required),
        value:new FormControl(''),
        perAc:new FormControl(''),
        perSqYards:new FormControl(''),
        extent:new FormControl('',Validators.pattern("^(?:\d+-\d+\.?\d*|(\d+\.?\d*))$")),
        syn:new FormControl(''),
        hn:new FormControl(''),
        plotNo:new FormControl('')
      })
    )
  }

  removeProperty(index: number) {
    this.properties=this.formdata.controls.property as FormArray
    this.properties.removeAt(index-1);
  }

}
