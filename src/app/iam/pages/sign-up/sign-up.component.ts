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
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

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
    LanguageSwitcherComponent,
    TranslateModule,
    MatSelectModule,
    MatOptionModule,
    CommonModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  form!: FormGroup;
  roles: Array<{ label: string; value: string }> = [];
  selectedRole = 'customer';
  submitted: boolean = false;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private builder: FormBuilder,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.roles = [
      { label: this.translateService.instant('signup.roleField.customer'), value: 'customer' },
      { label: this.translateService.instant('signup.roleField.manufacturer'), value: 'manufacturer' }
    ];
    this.form = this.builder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['customer', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.submitted = true;

    const username = this.form.value.username;
    const password = this.form.value.password;
    const role = this.form.value.role;
    let roles = ['ROLE_USER'];
    if (role === 'manufacturer') {
      roles.push('ROLE_MANUFACTURER');
    }
    const signUpRequest = new SignUpRequest(username, password, roles);

    this.authenticationService.signUp(signUpRequest);

    // Reset loading state after a reasonable time
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
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
      return this.translateService.instant('signup.validation.required', { field: this.getFieldName(controlName) });
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return this.translateService.instant('signup.validation.minlength', {
        field: this.getFieldName(controlName),
        length: requiredLength
      });
    }

    if (controlName === 'confirmPassword' && form.errors?.['passwordMismatch']) {
      return this.translateService.instant('signup.validation.passwordMismatch');
    }

    return '';
  }

  private getFieldName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      'username': 'signup.username',
      'password': 'signup.password',
      'confirmPassword': 'signup.confirmPassword'
    };
    return this.translateService.instant(fieldNames[controlName]) || controlName;
  }


}
