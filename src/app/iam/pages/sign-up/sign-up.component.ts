import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl} from "@angular/forms";
import {AuthenticationService} from '../../services/authentication.service';
import {SignUpRequest} from "../../model/sign-up.request";
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {RouterLink} from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    MatCardHeader,
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatPrefix,
    MatSuffix,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  form!: FormGroup;
  submitted: boolean = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private builder: FormBuilder, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.form = this.builder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit() {
    if (this.form.invalid) return;
    let username = this.form.value.username;
    let password = this.form.value.password;
    const signUpRequest = new SignUpRequest(username, password, ['ROLE_USER']);
    this.authenticationService.signUp(signUpRequest);
    this.submitted = true;
  }

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  isInvalidControl(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  errorMessagesForControl(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) {
      return `${this.getFieldName(controlName)} is required`;
    }
    
    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `${this.getFieldName(controlName)} must be at least ${requiredLength} characters`;
    }
    
    if (controlName === 'confirmPassword' && form.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    
    return '';
  }

  private getFieldName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      'username': 'Username',
      'password': 'Password',
      'confirmPassword': 'Confirm Password'
    };
    return fieldNames[controlName] || controlName;
  }


}
