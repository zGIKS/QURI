import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="languageMenu">
      <mat-icon>language</mat-icon>
    </button>

    <mat-menu #languageMenu="matMenu">
      <button
        mat-menu-item
        *ngFor="let language of availableLanguages"
        (click)="switchLanguage(language.code)"
        [class.selected]="language.code === currentLanguage">
        <mat-icon>{{ language.code === currentLanguage ? 'check' : 'language' }}</mat-icon>
        <span>{{ language.name }}</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .selected {
      background-color: rgba(0, 0, 0, 0.04);
      font-weight: 500;
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit {
  currentLanguage = 'en';
  availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.translationService.getCurrentLanguage().subscribe(language => {
      this.currentLanguage = language;
    });
  }

  switchLanguage(languageCode: string) {
    this.translationService.setLanguage(languageCode);
  }
}
