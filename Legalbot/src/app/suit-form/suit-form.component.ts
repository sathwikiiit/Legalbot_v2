import { Component, Input, OnInit } from '@angular/core';
import {FormArray,FormBuilder,FormControl,FormGroup,FormsModule,ReactiveFormsModule,Validators,} from '@angular/forms';
import { Router } from '@angular/router';
import { FetcherService } from '../services/fetcher.service';
import { PropertyFormControls, Suit, SuitFormControls, Party, SuitDto, PartyDto, PropertyDto } from '../suit';
import { PropertyComponent } from './property/property.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suit-form',
  imports: [ReactiveFormsModule, FormsModule, PropertyComponent, CommonModule],
  templateUrl: './suit-form.component.html',
  styleUrl: './suit-form.component.css'
})
export class SuitFormComponent implements OnInit {
  @Input() id!: number | undefined;
  suitDto: SuitDto = {
    court: '',
    city: '',
    lawyer: '',
    plaintiffs: [],
    defendants: [],
    property: [],
    date: undefined,
    suitType: '',
    counselDetails: '',
    id: ''
  };
  suit: Suit = new Suit();
  formdata: SuitFormControls;

  constructor(
    private fetcher: FetcherService,
    private routr: Router,
    private fb: FormBuilder
  ) {
    // Use Suit.createForm and patch user/date after creation
    this.formdata = Suit.createForm(
      [this.createPartyGroup()],
      [this.createPartyGroup()],
      [this.createPropertyFormGroup()]
    ) as unknown as SuitFormControls;
    this.formdata.get('user')?.setValue(this.fetcher.user);
    this.formdata.get('date')?.setValue(new Date());
  }

  ngOnInit(): void {
    // Fetch suit by id and map to suitDto if editing
    if (this.id) {
      this.fetcher.fetchsuitbyid(this.id).subscribe((suit: SuitDto) => {
        this.suitDto = suit;
        // Optionally, map to form controls if needed
      });
    }
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

  createPartyGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      address: [''],
      age: [''],
      gender: [''],
      occupation: [''],
      relation: [''],
      partyType: [''],
      guardianIndex: [null]
    });
  }

  get propertyFormArray(): FormArray<FormGroup<PropertyFormControls>> {
    return this.formdata.get("property") as FormArray<FormGroup<PropertyFormControls>>;
  }

  get plaintiffs() {
    return this.formdata.get("plaintiffs") as FormArray;
  }
  get defendants() {
    return this.formdata.get("defendants") as FormArray;
  }
  addProperty() {
    this.propertyFormArray.push(this.createPropertyFormGroup());
  }

  removeProperty(index: number) {
    this.propertyFormArray.removeAt(index); // Assuming index is 0-based
  }

  addPlaintiff() {
    this.plaintiffs.push(this.createPartyGroup());
  }

  removePlaintiff(index: number) {
    if (this.plaintiffs.length > 1) {
      this.plaintiffs.removeAt(index);
    }
  }

  addDefendant() {
    this.defendants.push(this.createPartyGroup());
  }

  removeDefendant(index: number) {
    if (this.defendants.length > 1) {
      this.defendants.removeAt(index);
    }
  }

  submited() {
    if (this.formdata.valid) {
      // Convert form data to SuitDto for backend
      const dto: SuitDto = (this.formdata.value as SuitDto);
      this.fetcher.submitSuit(dto).subscribe({
        next: (res) => {
          this.routr.navigate(['/dashboard']);
        },
        error: (err) => {
          alert('Submission failed');
        }
      });
    } else {
      this.formdata.markAllAsTouched();
    }
  }

  onSubmit() {
    // Map form data to SuitDto and send to backend
    const dto: SuitDto = this.suitDto; // or map from form controls
    this.fetcher.submitSuit(dto).subscribe();
  }
}