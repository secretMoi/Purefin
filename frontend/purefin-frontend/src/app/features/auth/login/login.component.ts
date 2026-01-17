import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        PasswordModule,
        CardModule,
        MessageModule,
        RouterLink
    ],
    template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="bg-slate-800 p-2 rounded-lg">
              <i class="pi pi-calculator text-emerald-400 text-2xl"></i>
            </div>
            <span class="text-2xl font-bold text-white">PureFin</span>
          </div>
          <p class="text-slate-400">Connectez-vous à votre compte</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="w-full mb-4"></p-message>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium text-slate-700">Email</label>
              <input
                pInputText
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                class="w-full"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div class="space-y-2">
              <label for="password" class="text-sm font-medium text-slate-700">Mot de passe</label>
              <p-password
                id="password"
                [(ngModel)]="password"
                name="password"
                [feedback]="false"
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
                placeholder="••••••••"
                required
              ></p-password>
            </div>

            <button
              pButton
              type="submit"
              label="Se connecter"
              [loading]="loading()"
              class="w-full bg-slate-900 hover:bg-slate-800"
            ></button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-slate-500 text-sm">
              Pas encore de compte ?
              <a routerLink="/register" class="text-emerald-600 hover:text-emerald-700 font-medium">
                Créer un compte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
    email = '';
    password = '';
    loading = signal(false);
    error = signal<string | null>(null);

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit(): void {
        if (!this.email || !this.password) {
            this.error.set('Veuillez remplir tous les champs.');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (response) {
                    this.router.navigate(['/']);
                } else {
                    this.error.set('Email ou mot de passe incorrect.');
                }
            },
            error: () => {
                this.loading.set(false);
                this.error.set('Une erreur est survenue. Veuillez réessayer.');
            }
        });
    }
}
