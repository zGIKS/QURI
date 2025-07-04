import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [NgFor, MatButtonModule],
  templateUrl: './language-switcher.html'
})
export class LanguageSwitcher {
  languages = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' }
  ];
  constructor(public translate: TranslateService) {}
  get currentLang() {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }
  switchLang(lang: string) {
    this.translate.use(lang);
  }
}
