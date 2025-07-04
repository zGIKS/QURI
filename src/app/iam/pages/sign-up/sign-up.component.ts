import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthenticationService} from '../../services/authentication.service';
import {SignUpRequest} from "../../model/sign-up.request";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    MatCardHeader,
    MatCard,
    MatCardTitle,
    MatCardContent,
    ReactiveFormsModule,
    MatFormField,
    MatError,
    MatInput,
    MatButton
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  form!: FormGroup;
  submitted: boolean = false;

  constructor(private builder: FormBuilder, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.form = this.builder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    let username = this.form.value.username;
    let password = this.form.value.password;
    const signUpRequest = new SignUpRequest(username, password, ['ROLE_USER']);
    this.authenticationService.signUp(signUpRequest);
    this.submitted = true;
  }

  isInvalidControl(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  errorMessagesForControl(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) {
      return `${controlName} is required`;
    }
    
    return '';
  }


}
