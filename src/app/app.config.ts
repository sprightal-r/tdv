import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { ApiModule, Configuration } from '@app/api-client';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { TelemetryEffects } from './stores/telemetry/telemetry.effects';
import { telemetryReducer } from './stores/telemetry/telemetry.reducer';

const apiConfigFunc = () =>
  new Configuration({
    basePath: '/api'
  });

export const appConfig: ApplicationConfig = {
  providers: [
    // Boilerplate
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    // API Client
    ...ApiModule.forRoot(apiConfigFunc).providers || [],

    // State Management
    provideStore({
      telemetry: telemetryReducer
    }),
    provideEffects(TelemetryEffects)
  ]
};

export const testConfig: ApplicationConfig = {
  providers: [
    // Boilerplate
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // State Management
    provideStore({
      telemetry: telemetryReducer
    })
  ]
}