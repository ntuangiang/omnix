
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app/app.component';
import { appConfig } from './src/app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideZonelessChangeDetection()
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
