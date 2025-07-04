import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SignInRequest} from "../../model/sign-in.request";
import {AuthenticationService} from "../../services/authentication.service";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {RouterLink} from "@angular/router";
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardHeader,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatIcon,
    MatPrefix,
    MatSuffix,
    ReactiveFormsModule,
    RouterLink,
    LanguageSwitcherComponent,
    TranslateModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  hidePassword = true;

  constructor(
    private builder: FormBuilder,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.form = this.builder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
      return this.translateService.instant('signin.validation.required', { field: this.getFieldName(controlName) });
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return this.translateService.instant('signin.validation.minlength', {
        field: this.getFieldName(controlName),
        length: requiredLength
      });
    }

    return '';
  }

  private getFieldName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      'username': 'signin.username',
      'password': 'signin.password'
    };
    return this.translateService.instant(fieldNames[controlName]) || controlName;
  }
}
