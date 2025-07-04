import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from './shared/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'QURI TeeLab';

  constructor(
    private translate: TranslateService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    // Initialize translation service
    this.translationService.initializeLanguage();
  }
}
