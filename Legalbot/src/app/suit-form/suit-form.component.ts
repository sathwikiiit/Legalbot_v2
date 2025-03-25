import { Component, Input, OnInit } from '@angular/core';
import {FormArray,FormBuilder,FormControl,FormGroup,FormsModule,ReactiveFormsModule,Validators,} from '@angular/forms';
import { Router } from '@angular/router';
import { FetcherService } from '../services/fetcher.service';
import { Suit } from '../suit';
import { PropertyComponent } from './property/property.component';
import { CommonModule } from '@angular/common';

export interface PropertyFormControls {
  type: FormControl<string | null>;
  value: FormControl<string | null>;
  extent: FormControl<string | null>;
  syn: FormControl<string | null>;
  hn: FormControl<string | null>;
  plotNo: FormControl<string | null>;
}

@Component({
  selector: 'app-suit-form',
  imports: [ReactiveFormsModule, FormsModule, PropertyComponent, CommonModule],
  templateUrl: './suit-form.component.html',
  styleUrl: './suit-form.component.css'
})
export class SuitFormComponent implements OnInit {
  @Input() id!: number | undefined;
  suit: Suit = new Suit();
  formdata: FormGroup<{
    suitType: FormControl<string | null>;
    court: FormControl<string | null>;
    city: FormControl<string | null>;
    counselDetails: FormControl<string | null>;
    plaintiff1: FormControl<string | null>;
    defendant1: FormControl<string | null>;
    plaintiffs: FormControl<string | null>;
    defendants: FormControl<string | null>;
    property: FormArray<FormGroup<PropertyFormControls>>;
  }>;

  constructor(
    private fetcher: FetcherService,
    private routr: Router,
    private fb: FormBuilder
  ) {
    this.formdata = this.fb.group({
      suitType: ['', Validators.required],
      court: ['', Validators.required],
      city: ['', Validators.required],
      counselDetails: [''],
      plaintiff1: ['', Validators.required],
      defendant1: ['', Validators.required],
      plaintiffs: [''],
      defendants: [''],
      property: this.fb.array([this.createPropertyFormGroup()])
    });
  }

  ngOnInit(): void {
    // Implement logic to fetch data for editing if this.id is present
  }

  createPropertyFormGroup(): FormGroup<PropertyFormControls> {
    return this.fb.group({
      type: ['', Validators.required],
      value: [''],
      extent: [''],
      syn: [''],
      hn: [''],
      plotNo: ['']
    });
  }

  get propertyFormArray(): FormArray<FormGroup<PropertyFormControls>> {
    return this.formdata.controls.property as FormArray<FormGroup<PropertyFormControls>>;
  }

  submited() {
    this.formdata.updateValueAndValidity();
    if (this.formdata.valid) {
      this.fetcher.postsuit(this.formdata.getRawValue()).subscribe({
        next: (response) => {
          console.log('Suit submitted successfully', response);
          this.fetcher.changed();
          this.routr.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error submitting suit', error);
          // Handle error, maybe show a message to the user
        }
      });
    } else {
      console.log(this.formdata.errors);
    }
  }

  addProperty() {
    this.propertyFormArray.push(this.createPropertyFormGroup());
  }

  removeProperty(index: number) {
    this.propertyFormArray.removeAt(index); // Assuming index is 0-based
  }
}