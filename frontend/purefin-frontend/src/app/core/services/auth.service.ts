import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, of } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = 'http://localhost:5209/api/auth';
    private readonly TOKEN_KEY = 'purefin_token';
    private readonly USER_KEY = 'purefin_user';

    private currentUser = signal<User | null>(null);
    private token = signal<string | null>(null);

    isAuthenticated = computed(() => !!this.token());
    user = computed(() => this.currentUser());

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            const storedToken = localStorage.getItem(this.TOKEN_KEY);
            const storedUser = localStorage.getItem(this.USER_KEY);

            if (storedToken && storedUser) {
                try {
                    this.token.set(storedToken);
                    this.currentUser.set(JSON.parse(storedUser));
                } catch {
                    this.clearStorage();
                }
            }
        }
    }

    private saveToStorage(response: AuthResponse): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            const user: User = {
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    }

    private clearStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        }
    }

    register(request: RegisterRequest): Observable<AuthResponse | null> {
        return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
            tap(response => {
                this.token.set(response.token);
                this.currentUser.set({
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName
                });
                this.saveToStorage(response);
            }),
            catchError(err => {
                console.error('Register error:', err);
                return of(null);
            })
        );
    }

    login(request: LoginRequest): Observable<AuthResponse | null> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
            tap(response => {
                this.token.set(response.token);
                this.currentUser.set({
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName
                });
                this.saveToStorage(response);
            }),
            catchError(err => {
                console.error('Login error:', err);
                return of(null);
            })
        );
    }

    logout(): void {
        this.token.set(null);
        this.currentUser.set(null);
        this.clearStorage();
    }

    getToken(): string | null {
        return this.token();
    }
}
