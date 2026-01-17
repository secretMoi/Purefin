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
    selector: 'app-register',
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
          <p class="text-slate-400">Créez votre compte gratuit</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="w-full mb-4"></p-message>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="firstName" class="text-sm font-medium text-slate-700">Prénom</label>
                <input
                  pInputText
                  id="firstName"
                  type="text"
                  [(ngModel)]="firstName"
                  name="firstName"
                  class="w-full"
                  placeholder="Jean"
                  required
                />
              </div>
              <div class="space-y-2">
                <label for="lastName" class="text-sm font-medium text-slate-700">Nom</label>
                <input
                  pInputText
                  id="lastName"
                  type="text"
                  [(ngModel)]="lastName"
                  name="lastName"
                  class="w-full"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

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
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
                placeholder="Minimum 6 caractères"
                required
              ></p-password>
            </div>

            <button
              pButton
              type="submit"
              label="Créer mon compte"
              [loading]="loading()"
              class="w-full bg-emerald-600 hover:bg-emerald-700"
            ></button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-slate-500 text-sm">
              Déjà inscrit ?
              <a routerLink="/login" class="text-emerald-600 hover:text-emerald-700 font-medium">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
    firstName = '';
    lastName = '';
    email = '';
    password = '';
    loading = signal(false);
    error = signal<string | null>(null);

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit(): void {
        if (!this.firstName || !this.lastName || !this.email || !this.password) {
            this.error.set('Veuillez remplir tous les champs.');
            return;
        }

        if (this.password.length < 6) {
            this.error.set('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        this.authService.register({
            email: this.email,
            password: this.password,
            firstName: this.firstName,
            lastName: this.lastName
        }).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (response) {
                    this.router.navigate(['/']);
                } else {
                    this.error.set('Un compte avec cet email existe déjà.');
                }
            },
            error: () => {
                this.loading.set(false);
                this.error.set('Une erreur est survenue. Veuillez réessayer.');
            }
        });
    }
}
