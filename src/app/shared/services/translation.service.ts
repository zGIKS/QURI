import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = new BehaviorSubject<string>('en');

  constructor(private translate: TranslateService) {
    // Don't initialize here to avoid circular dependency
  }

  initializeLanguage(): void {
    // Set available languages
    this.translate.addLangs(['en', 'es']);

    // Set the default language first
    this.translate.setDefaultLang('en');

    // Get stored language or default to 'en'
    const storedLanguage = localStorage.getItem('language');
    const browserLanguage = this.translate.getBrowserLang();

    let defaultLanguage = 'en';

    if (storedLanguage && ['en', 'es'].includes(storedLanguage)) {
      defaultLanguage = storedLanguage;
    } else if (browserLanguage && ['en', 'es'].includes(browserLanguage)) {
      defaultLanguage = browserLanguage;
    }

    // Use the language (this will load the translation files)
    this.translate.use(defaultLanguage).subscribe({
      next: () => {
        localStorage.setItem('language', defaultLanguage);
        this.currentLanguage.next(defaultLanguage);
        console.log('Language initialized:', defaultLanguage);
      },
      error: (error) => {
        console.error('Error loading translation files:', error);
        // Fallback to English if there's an error
        this.translate.use('en').subscribe(() => {
          this.currentLanguage.next('en');
        });
      }
    });
  }

  setLanguage(language: string): void {
    if (['en', 'es'].includes(language)) {
      this.translate.use(language).subscribe({
        next: () => {
          this.translate.setDefaultLang(language);
          localStorage.setItem('language', language);
          this.currentLanguage.next(language);
          console.log('Language changed to:', language);
        },
        error: (error) => {
          console.error('Error changing language:', error);
        }
      });
    }
  }

  getCurrentLanguage(): Observable<string> {
    return this.currentLanguage.asObservable();
  }

  getCurrentLanguageValue(): string {
    return this.currentLanguage.value;
  }

  getAvailableLanguages(): Array<{code: string, name: string}> {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' }
    ];
  }

  translateText(key: string, params?: any): Observable<string> {
    return this.translate.get(key, params);
  }

  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }
}
