import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SignInRequest} from "../../model/sign-in.request";
import {AuthenticationService} from "../../services/authentication.service";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatCardHeader,
    MatFormField,
    MatInput,
    MatError,
    ReactiveFormsModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;

  constructor(private builder: FormBuilder, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.form = this.builder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    let username = this.form.value.username;
    let password = this.form.value.password;
    const signInRequest = new SignInRequest(username, password);
    this.authenticationService.signIn(signInRequest);
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
