# Angular 21 Best Practices & Guidelines

> Ce document définit les standards de développement pour les projets Angular 21+.
> Toutes les règles doivent être appliquées systématiquement.

---

## Table des Matières

1. [Signals & État Réactif](#1-signals--état-réactif)
2. [RxJS & Gestion Asynchrone](#2-rxjs--gestion-asynchrone)
3. [Architecture & Structure du Projet](#3-architecture--structure-du-projet)
4. [Séparation HTML/TS (Templates)](#4-séparation-htmlts-templates)
5. [Composants & Directives](#5-composants--directives)
6. [Services & Injection de Dépendances](#6-services--injection-de-dépendances)
7. [Formulaires](#7-formulaires)
8. [Testing](#8-testing)
9. [Performance](#9-performance)
10. [Accessibilité (a11y)](#10-accessibilité-a11y)
11. [Anti-Patterns à Éviter](#11-anti-patterns-à-éviter)

---

## 1. Signals & État Réactif

### 1.1 Principes Fondamentaux

Les Signals sont le **mécanisme principal** de gestion d'état dans Angular 21+. Ils remplacent les patterns basés sur `BehaviorSubject` pour l'état local.

```typescript
// ✅ BON - État local avec signals
export class UserProfileComponent {
  // État mutable avec signal()
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  
  // État dérivé avec computed()
  readonly fullName = computed(() => 
    `${this.firstName()} ${this.lastName()}`.trim()
  );
  
  readonly isValid = computed(() => 
    this.firstName().length > 0 && this.lastName().length > 0
  );
}

// ❌ MAUVAIS - BehaviorSubject pour état local simple
export class UserProfileComponent {
  private firstName$ = new BehaviorSubject('');
  private lastName$ = new BehaviorSubject('');
}
```

### 1.2 Règles d'Utilisation des Signals

#### Déclaration
```typescript
// ✅ Toujours typer explicitement les signals avec valeurs nullables
readonly user = signal<User | null>(null);
readonly items = signal<Item[]>([]);
readonly count = signal(0); // Type inféré acceptable pour primitives

// ❌ Éviter any
readonly data = signal<any>(null);
```

#### Mise à jour de l'état
```typescript
// ✅ Utiliser set() pour remplacer complètement la valeur
this.count.set(10);

// ✅ Utiliser update() pour transformations basées sur valeur précédente
this.count.update(current => current + 1);
this.items.update(items => [...items, newItem]);

// ❌ NE JAMAIS utiliser mutate() - déprécié
this.items.mutate(arr => arr.push(item));
```

#### Computed Signals
```typescript
// ✅ computed() pour état dérivé
readonly totalPrice = computed(() => 
  this.items().reduce((sum, item) => sum + item.price, 0)
);

readonly formattedDate = computed(() => 
  new Intl.DateTimeFormat('fr-BE').format(this.date())
);

// ✅ Chaînage de computed
readonly discountedPrice = computed(() => 
  this.totalPrice() * (1 - this.discountRate())
);

// ❌ Ne pas créer de computed dans des méthodes ou boucles
// Ils doivent être des propriétés de classe
```

### 1.3 Effects

Les `effect()` sont réservés aux **effets de bord** (logging, localStorage, API calls déclenchés par changement d'état).

```typescript
// ✅ Effect pour synchronisation avec localStorage
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>('light');
  
  constructor() {
    // Charger depuis storage au démarrage
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      this.theme.set(saved);
    }
    
    // Sauvegarder automatiquement les changements
    effect(() => {
      localStorage.setItem('theme', this.theme());
    });
  }
}

// ✅ Effect pour logging/debugging
effect(() => {
  console.debug('[State]', this.currentState());
});

// ❌ NE PAS utiliser effect pour mettre à jour d'autres signals
// Cela crée des cycles et rend le flux de données imprévisible
effect(() => {
  this.derivedValue.set(this.sourceValue() * 2); // INTERDIT
});
// → Utiliser computed() à la place
```

### 1.4 Signal Inputs & Outputs (Angular 21+)

```typescript
// ✅ Utiliser input() au lieu de @Input()
export class CardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input(''); // Valeur par défaut
  readonly data = input<CardData | undefined>(undefined);
  
  // Input avec transformation
  readonly count = input(0, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  
  // Computed basé sur input
  readonly displayTitle = computed(() => 
    this.title().toUpperCase()
  );
}

// ✅ Utiliser output() au lieu de @Output()
export class SearchComponent {
  readonly search = output<string>();
  readonly select = output<Item>();
  
  onSearch(term: string): void {
    this.search.emit(term);
  }
}

// ❌ DÉPRÉCIÉ - Ne plus utiliser
@Input() title: string = '';
@Output() search = new EventEmitter<string>();
```

### 1.5 Model Signals (Two-Way Binding)

```typescript
// ✅ Pour le two-way binding avec les composants
export class RatingComponent {
  readonly value = model.required<number>();
  
  increase(): void {
    this.value.update(v => Math.min(v + 1, 5));
  }
}

// Usage dans le template parent
// <app-rating [(value)]="rating" />
```

---

## 2. RxJS & Gestion Asynchrone

### 2.1 Quand Utiliser RxJS vs Signals

| Cas d'usage | Solution recommandée |
|-------------|---------------------|
| État local du composant | `signal()` |
| Valeurs dérivées | `computed()` |
| Appels HTTP simples | `Observable` + `async` pipe ou `toSignal()` |
| Streams temps réel (WebSocket) | `Observable` |
| Événements utilisateur avec debounce/throttle | `Observable` (fromEvent + opérateurs) |
| Combinaison de multiples sources async | `combineLatest`, `forkJoin` |
| État partagé global | `signal()` dans un service |

### 2.2 Conversion Observable ↔ Signal

```typescript
// ✅ Observable vers Signal avec toSignal()
export class ProductListComponent {
  private productService = inject(ProductService);
  
  // Convertir Observable en Signal
  readonly products = toSignal(
    this.productService.getProducts(),
    { initialValue: [] }
  );
  
  // Avec gestion d'erreur
  readonly productsResource = toSignal(
    this.productService.getProducts().pipe(
      catchError(err => {
        console.error(err);
        return of([]);
      })
    ),
    { initialValue: [] }
  );
}

// ✅ Signal vers Observable avec toObservable()
export class SearchService {
  readonly searchTerm = signal('');
  
  readonly searchResults$ = toObservable(this.searchTerm).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.api.search(term))
  );
}
```

### 2.3 Patterns RxJS Recommandés

#### Appels HTTP dans les Services
```typescript
// ✅ Service avec méthodes retournant Observable
@Injectable({ providedIn: 'root' })
export class SimulationService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = '/api/simulations';
  
  getSimulations(): Observable<Simulation[]> {
    return this.http.get<Simulation[]>(this.API_URL);
  }
  
  getSimulation(id: string): Observable<Simulation> {
    return this.http.get<Simulation>(`${this.API_URL}/${id}`);
  }
  
  saveSimulation(data: SaveSimulationRequest): Observable<Simulation> {
    return this.http.post<Simulation>(this.API_URL, data);
  }
  
  deleteSimulation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
```

#### Consommation dans les Composants
```typescript
// ✅ Pattern 1: async pipe (recommandé pour listes simples)
@Component({
  template: `
    @if (simulations$ | async; as simulations) {
      @for (sim of simulations; track sim.id) {
        <app-simulation-card [simulation]="sim" />
      }
    } @else {
      <app-loading-spinner />
    }
  `
})
export class SimulationListComponent {
  readonly simulations$ = inject(SimulationService).getSimulations();
}

// ✅ Pattern 2: toSignal (recommandé quand besoin de réactivité)
export class SimulationListComponent {
  private readonly simulationService = inject(SimulationService);
  
  readonly simulations = toSignal(
    this.simulationService.getSimulations(),
    { initialValue: [] }
  );
  
  // Computed basé sur le signal
  readonly hasSimulations = computed(() => this.simulations().length > 0);
}

// ✅ Pattern 3: gestion manuelle pour actions complexes
export class SimulationFormComponent {
  private readonly simulationService = inject(SimulationService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  
  readonly isLoading = signal(false);
  
  save(data: SaveSimulationRequest): void {
    this.isLoading.set(true);
    
    this.simulationService.saveSimulation(data).subscribe({
      next: (result) => {
        this.messageService.add({ severity: 'success', summary: 'Saved' });
        this.router.navigate(['/simulations', result.id]);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error' });
        console.error(err);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
```

### 2.4 Opérateurs RxJS Essentiels

```typescript
// ✅ switchMap - Annule la requête précédente (recherche, autocomplete)
readonly searchResults$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.api.search(term))
);

// ✅ exhaustMap - Ignore les nouvelles requêtes pendant traitement (submit form)
readonly submitResult$ = this.submit$.pipe(
  exhaustMap(data => this.api.save(data))
);

// ✅ concatMap - Traite séquentiellement (ordre important)
readonly orderedResults$ = this.items$.pipe(
  concatMap(item => this.api.process(item))
);

// ✅ mergeMap - Traite en parallèle (ordre non important)
readonly parallelResults$ = this.items$.pipe(
  mergeMap(item => this.api.process(item), 3) // max 3 en parallèle
);

// ✅ takeUntilDestroyed - Auto-cleanup
export class MyComponent {
  private readonly destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    this.source$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      // ...
    });
  }
}
```

### 2.5 Anti-Patterns RxJS

```typescript
// ❌ Subscribe imbriqués (callback hell)
this.api.getUser().subscribe(user => {
  this.api.getOrders(user.id).subscribe(orders => {
    this.api.getProducts(orders[0].id).subscribe(products => {
      // ...
    });
  });
});

// ✅ Utiliser les opérateurs
this.api.getUser().pipe(
  switchMap(user => this.api.getOrders(user.id)),
  switchMap(orders => this.api.getProducts(orders[0].id))
).subscribe(products => {
  // ...
});

// ❌ Oublier de se désabonner
ngOnInit(): void {
  this.source$.subscribe(); // FUITE MÉMOIRE
}

// ✅ Utiliser takeUntilDestroyed ou async pipe
readonly data$ = this.source$.pipe(
  takeUntilDestroyed()
);
```

---

## 3. Architecture & Structure du Projet

### 3.1 Structure de Dossiers Recommandée

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── api.service.ts
│   │   ├── models/              # Interfaces/Types partagés
│   │   │   ├── user.model.ts
│   │   │   └── api-response.model.ts
│   │   └── logic/               # Pure functions, calculs métier
│   │       └── calculation.ts
│   │
│   ├── shared/                  # Composants/Pipes/Directives réutilisables
│   │   ├── components/
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   └── modal/
│   │   ├── directives/
│   │   │   └── tooltip.directive.ts
│   │   ├── pipes/
│   │   │   └── currency-format.pipe.ts
│   │   └── ui/                  # Composants UI génériques (BaseList, etc.)
│   │       └── list-base/
│   │
│   ├── features/                # Modules fonctionnels (lazy-loaded)
│   │   ├── simulation/
│   │   │   ├── simulation.component.ts
│   │   │   ├── simulation.component.html
│   │   │   ├── simulation.component.scss
│   │   │   ├── simulation.routes.ts
│   │   │   └── components/      # Sous-composants spécifiques
│   │   │       └── simulation-form/
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   └── dashboard/
│   │
│   ├── layouts/                 # Layouts de pages
│   │   ├── main-layout/
│   │   └── auth-layout/
│   │
│   ├── styles/                  # Styles globaux
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── _utilities.scss
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── assets/
├── environments/
└── index.html
```

### 3.2 Principes d'Organisation

#### Core Module
- Services **singletons** uniquement
- Guards et Interceptors
- Modèles/Interfaces partagés globalement
- Logique métier pure (fonctions sans effets de bord)

```typescript
// core/logic/simulation-calculator.ts
// ✅ Pure function - testable, réutilisable
export function calculateTax(income: number): number {
  // Logique pure, aucune dépendance externe
  if (income <= 15200) return income * 0.25;
  if (income <= 26830) return 15200 * 0.25 + (income - 15200) * 0.40;
  // ...
}

// ✅ Ou classe statique pour regroupement logique
export class SimulationCalculator {
  static calculate(data: SimulationData): SimulationResult {
    // ...
  }
  
  private static calculateIPP(income: number): number {
    // ...
  }
}
```

#### Shared Module
- Composants **réutilisables** sans logique métier
- Pipes personnalisés
- Directives génériques
- **Aucune dépendance vers features/**

#### Features
- Chaque feature est **auto-contenue**
- Lazy loading par défaut
- Sous-composants spécifiques dans `components/`

### 3.3 Routing & Lazy Loading

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/simulation/simulation.component')
      .then(m => m.SimulationComponent)
  },
  {
    path: 'estimator',
    loadComponent: () => import('./features/tjm-estimator/tjm-estimator.component')
      .then(m => m.TjmEstimatorComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

---

## 4. Séparation HTML/TS (Templates)

### 4.1 Règles de Séparation

**Pour ce projet, toujours utiliser des fichiers HTML séparés.**

| Taille du Template | Recommandation |
|-------------------|----------------|
| Tous les composants | Fichier séparé (`.html`) - **OBLIGATOIRE** |

> **Note:** Bien que les petits templates (<20 lignes) puissent techniquement être en inline dans d'autres projets, ce projet impose la séparation systématique pour une meilleure maintenabilité et cohérence.

```typescript
// ✅ Composant avec fichier HTML séparé (STANDARD pour ce projet)
@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  readonly status = input.required<'active' | 'pending' | 'inactive'>();
  
  readonly label = computed(() => {
    const labels = { active: 'Actif', pending: 'En attente', inactive: 'Inactif' };
    return labels[this.status()];
  });
  
  readonly statusClass = computed(() => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return classes[this.status()];
  });
}

// Fichier status-badge.component.html:
// <span 
//   class="px-2 py-1 rounded-full text-xs font-medium"
//   [class]="statusClass()"
// >
//   {{ label() }}
// </span>
```

### 4.2 Bonnes Pratiques Templates

#### Control Flow (Angular 21+)
```html
<!-- ✅ Utiliser @if, @for, @switch -->
@if (isLoading()) {
  <app-skeleton />
} @else if (error()) {
  <app-error-message [message]="error()" />
} @else {
  @for (item of items(); track item.id) {
    <app-item-card [item]="item" />
  } @empty {
    <p>Aucun élément</p>
  }
}

@switch (status()) {
  @case ('active') {
    <span class="text-green-500">Actif</span>
  }
  @case ('pending') {
    <span class="text-yellow-500">En attente</span>
  }
  @default {
    <span class="text-gray-500">Inconnu</span>
  }
}

<!-- ❌ NE PLUS utiliser *ngIf, *ngFor, *ngSwitch -->
<div *ngIf="isLoading">...</div>
<div *ngFor="let item of items">...</div>
```

#### Bindings
```html
<!-- ✅ Class binding conditionnel -->
<div 
  class="base-class"
  [class.active]="isActive()"
  [class.disabled]="isDisabled()"
>

<!-- ✅ Ou avec objet pour multiple classes -->
<div [class]="{
  'bg-green-100': status() === 'active',
  'bg-yellow-100': status() === 'pending',
  'opacity-50': isDisabled()
}">

<!-- ❌ Éviter ngClass -->
<div [ngClass]="{ 'active': isActive }">

<!-- ✅ Style binding -->
<div 
  [style.width.px]="width()"
  [style.opacity]="isVisible() ? 1 : 0"
>

<!-- ❌ Éviter ngStyle -->
<div [ngStyle]="{ 'width.px': width }">
```

#### Événements
```html
<!-- ✅ Event binding simple -->
<button (click)="handleClick()">Click</button>

<!-- ✅ Avec paramètres -->
<button (click)="handleClick($event, item)">Click</button>

<!-- ✅ Avec modificateurs -->
<input (keydown.enter)="submit()" />
<div (click.stop)="handleClick()">

<!-- ❌ NE PAS écrire de logique dans le template -->
<button (click)="items.push(newItem); count = count + 1">Add</button>

<!-- ❌ NE PAS utiliser de fonctions fléchées dans le template -->
<button (click)="() => doSomething()">Click</button>
```

### 4.3 Éviter la Logique dans les Templates

```html
<!-- ❌ MAUVAIS - Calculs dans le template -->
<span>{{ items.filter(i => i.active).length }} actifs</span>
<span>{{ price * quantity * (1 - discount / 100) | currency }}</span>

<!-- ✅ BON - Utiliser computed() dans le composant -->
<span>{{ activeItemsCount() }} actifs</span>
<span>{{ totalPrice() | currency }}</span>
```

```typescript
// Dans le composant
readonly activeItemsCount = computed(() => 
  this.items().filter(i => i.active).length
);

readonly totalPrice = computed(() => 
  this.price() * this.quantity() * (1 - this.discount() / 100)
);
```

---

## 5. Composants & Directives

### 5.1 Configuration du Composant

```typescript
@Component({
  selector: 'app-user-card',
  // ✅ standalone est true par défaut en Angular 21, ne pas le spécifier
  // ❌ standalone: true, // Redondant
  
  // ✅ Importer uniquement ce qui est nécessaire
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule
  ],
  
  // ✅ OnPush obligatoire pour performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  
  // ✅ Template/Style selon taille
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
  
  // ✅ Host bindings dans le décorateur (pas @HostBinding)
  host: {
    'class': 'block p-4 rounded-lg',
    '[class.active]': 'isActive()',
    '(click)': 'handleHostClick($event)'
  }
})
export class UserCardComponent {
  // ...
}
```

### 5.2 Structure du Composant

```typescript
@Component({ /* ... */ })
export class UserProfileComponent {
  // 1. Injection de dépendances
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  
  // 2. Inputs
  readonly userId = input.required<string>();
  readonly showActions = input(true);
  
  // 3. Outputs
  readonly userUpdated = output<User>();
  readonly deleted = output<void>();
  
  // 4. State signals
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly user = signal<User | null>(null);
  
  // 5. Computed signals
  readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  
  readonly canEdit = computed(() => 
    !this.isLoading() && this.user() !== null
  );
  
  // 6. Lifecycle hooks (si nécessaire)
  constructor() {
    // Effects
    effect(() => {
      console.log('User changed:', this.user());
    });
  }
  
  // 7. Méthodes publiques
  loadUser(): void {
    this.isLoading.set(true);
    this.userService.getUser(this.userId()).subscribe({
      next: (user) => {
        this.user.set(user);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load user');
        this.isLoading.set(false);
      }
    });
  }
  
  updateUser(data: Partial<User>): void {
    // ...
    this.userUpdated.emit(updatedUser);
  }
  
  // 8. Méthodes privées
  private validate(): boolean {
    // ...
  }
}
```

### 5.3 Directives

```typescript
// ✅ Directive avec signals
@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.backgroundColor]': 'bgColor()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()'
  }
})
export class HighlightDirective {
  readonly color = input('yellow', { alias: 'appHighlight' });
  
  private readonly isHovered = signal(false);
  
  readonly bgColor = computed(() => 
    this.isHovered() ? this.color() : 'transparent'
  );
  
  onMouseEnter(): void {
    this.isHovered.set(true);
  }
  
  onMouseLeave(): void {
    this.isHovered.set(false);
  }
}

// ❌ NE PAS utiliser @HostBinding/@HostListener
@HostBinding('style.backgroundColor') bgColor: string; // DÉPRÉCIÉ
@HostListener('mouseenter') onMouseEnter() {} // DÉPRÉCIÉ
```

---

## 6. Services & Injection de Dépendances

### 6.1 Service Singleton

```typescript
// ✅ Service global avec providedIn: 'root'
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  // État avec signals
  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);
  
  // Exposer en lecture seule
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(response => {
        this._token.set(response.token);
        this._user.set(response.user);
      })
    );
  }
  
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }
}
```

### 6.2 Injection Moderne

```typescript
// ✅ Utiliser inject() au lieu du constructeur
export class UserComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
}

// ❌ Éviter l'injection par constructeur
constructor(
  private userService: UserService,
  private router: Router
) {}
```

### 6.3 Injection Optionnelle

```typescript
// ✅ Injection optionnelle
private readonly analytics = inject(AnalyticsService, { optional: true });

// Utilisation
this.analytics?.track('event');
```

---

## 7. Formulaires

### 7.1 Reactive Forms (Recommandé)

```typescript
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          formControlName="email"
          [class.error]="form.controls.email.invalid && form.controls.email.touched"
        />
        @if (form.controls.email.errors?.['required'] && form.controls.email.touched) {
          <span class="error-message">Email requis</span>
        }
        @if (form.controls.email.errors?.['email'] && form.controls.email.touched) {
          <span class="error-message">Email invalide</span>
        }
      </div>
      
      <button type="submit" [disabled]="form.invalid || isLoading()">
        Enregistrer
      </button>
    </form>
  `
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  
  readonly isLoading = signal(false);
  
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required]],
    phone: ['', [Validators.pattern(/^\+?[0-9]{10,}$/)]]
  });
  
  onSubmit(): void {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      // ...
    }
  }
}
```

### 7.2 Typed Forms

```typescript
// ✅ Typage fort des formulaires
interface UserFormValue {
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

readonly form = this.fb.group<UserFormValue>({
  email: '',
  firstName: '',
  lastName: '',
  phone: null
});

// Le type est automatiquement inféré
const value: UserFormValue = this.form.getRawValue();
```

### 7.3 Forms avec Signals (Pattern Hybride)

```typescript
// Pour des formulaires simples, combiner signals et ngModel
@Component({
  imports: [FormsModule],
  template: `
    <input [(ngModel)]="email" />
    <span>{{ emailValid() ? '✓' : '✗' }}</span>
  `
})
export class SimpleFormComponent {
  readonly email = signal('');
  
  readonly emailValid = computed(() => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())
  );
}
```

---

## 8. Testing

### 8.1 Structure des Tests

```
src/
├── app/
│   ├── features/
│   │   └── simulation/
│   │       ├── simulation.component.ts
│   │       └── simulation.component.spec.ts  # Test unitaire
│   │
│   └── core/
│       ├── services/
│       │   └── auth.service.spec.ts
│       └── logic/
│           └── simulation-calculator.spec.ts
│
└── tests/                    # Tests E2E
    └── e2e/
        └── simulation.e2e.ts
```

### 8.2 Test de Composant

```typescript
// simulation.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationComponent } from './simulation.component';
import { SimulationService } from '@core/services/simulation.service';
import { of } from 'rxjs';

describe('SimulationComponent', () => {
  let component: SimulationComponent;
  let fixture: ComponentFixture<SimulationComponent>;
  let simulationServiceSpy: jasmine.SpyObj<SimulationService>;
  
  beforeEach(async () => {
    simulationServiceSpy = jasmine.createSpyObj('SimulationService', [
      'getSimulations',
      'saveSimulation'
    ]);
    simulationServiceSpy.getSimulations.and.returnValue(of([]));
    
    await TestBed.configureTestingModule({
      imports: [SimulationComponent],
      providers: [
        { provide: SimulationService, useValue: simulationServiceSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(SimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should display loading state initially', () => {
    component.isLoading.set(true);
    fixture.detectChanges();
    
    const loadingEl = fixture.nativeElement.querySelector('[data-testid="loading"]');
    expect(loadingEl).toBeTruthy();
  });
  
  it('should calculate net annual correctly', () => {
    component.revenue.set(100000);
    component.grossSalaryMonthly.set(4000);
    
    expect(component.netAnnual()).toBeGreaterThan(0);
    expect(component.netAnnual()).toBeLessThan(100000);
  });
});
```

### 8.3 Test de Service

```typescript
// auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should login successfully', () => {
    const mockResponse = { token: 'abc123', user: { email: 'test@test.com' } };
    
    service.login({ email: 'test@test.com', password: 'password' })
      .subscribe(response => {
        expect(response.token).toBe('abc123');
        expect(service.isAuthenticated()).toBeTrue();
      });
    
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  
  it('should logout and clear state', () => {
    // Setup authenticated state
    service['_token'].set('token');
    service['_user'].set({ email: 'test@test.com' } as any);
    
    service.logout();
    
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
  });
});
```

### 8.4 Test de Pure Functions

```typescript
// simulation-calculator.spec.ts
import { SimulationCalculator, SimulationData } from './simulation-calculator';

describe('SimulationCalculator', () => {
  const baseData: SimulationData = {
    revenue: 120000,
    grossSalaryMonthly: 4000,
    insuranceAnnual: 2000,
    phoneMonthly: 50,
    internetMonthly: 50,
    carMonthly: 600,
    mealVouchersMonthly: 160,
    restaurantMonthly: 200,
    pensionAnnual: 3000,
    otherAnnual: 0
  };
  
  it('should calculate positive net annual', () => {
    const result = SimulationCalculator.calculate(baseData);
    expect(result.netAnnual).toBeGreaterThan(0);
  });
  
  it('should apply reduced corporate tax rate for high salary', () => {
    const highSalaryData = { ...baseData, grossSalaryMonthly: 5000 };
    const result = SimulationCalculator.calculate(highSalaryData);
    
    // With salary >= 45k, reduced rate (20%) applies
    expect(result.corpTax).toBeLessThan(result.taxableProfit * 0.25);
  });
  
  it('should handle zero revenue', () => {
    const zeroRevenue = { ...baseData, revenue: 0 };
    const result = SimulationCalculator.calculate(zeroRevenue);
    
    expect(result.reserves).toBeLessThanOrEqual(0);
    expect(result.corpTax).toBe(0);
  });
});
```

### 8.5 Data-Testid Pattern

```html
<!-- Ajouter des identifiants pour les tests -->
<button 
  data-testid="submit-button"
  (click)="submit()"
>
  Enregistrer
</button>

<div data-testid="error-message">
  {{ error() }}
</div>

@if (isLoading()) {
  <app-spinner data-testid="loading-spinner" />
}
```

---

## 9. Performance

### 9.1 OnPush Change Detection

```typescript
// ✅ OBLIGATOIRE pour tous les composants
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 9.2 TrackBy avec @for

```html
<!-- ✅ Toujours utiliser track -->
@for (item of items(); track item.id) {
  <app-item [item]="item" />
}

<!-- Pour index si pas d'id unique -->
@for (item of items(); track $index) {
  <app-item [item]="item" />
}
```

### 9.3 Lazy Loading

```typescript
// Routes avec lazy loading
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin.component')
    .then(m => m.AdminComponent),
  loadChildren: () => import('./features/admin/admin.routes')
    .then(m => m.ADMIN_ROUTES)
}
```

### 9.4 Defer Blocks

```html
<!-- ✅ Charger les composants lourds à la demande -->
@defer (on viewport) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <div class="h-96 bg-gray-100 animate-pulse rounded" />
} @loading (minimum 500ms) {
  <app-skeleton-chart />
}

<!-- Defer avec conditions -->
@defer (when isTabActive()) {
  <app-tab-content />
}
```

### 9.5 Virtual Scrolling

```typescript
// Pour longues listes
import { CdkVirtualScrollViewport, CdkVirtualForOf } from '@angular/cdk/scrolling';

@Component({
  imports: [CdkVirtualScrollViewport, CdkVirtualForOf],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="h-96">
      <div *cdkVirtualFor="let item of items()" class="h-[50px]">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
```

---

## 10. Accessibilité (a11y)

### 10.1 Règles Obligatoires

```html
<!-- ✅ Labels pour tous les inputs -->
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-hint" />
<span id="email-hint">Votre adresse email professionnelle</span>

<!-- ✅ Boutons avec texte accessible -->
<button aria-label="Fermer le modal">
  <i class="pi pi-times"></i>
</button>

<!-- ✅ Images avec alt -->
<img [src]="user.avatar" [alt]="user.name + ' profile picture'" />

<!-- ✅ Structure sémantique -->
<header>...</header>
<main>
  <article>
    <h1>Titre principal</h1>
    <section>
      <h2>Sous-section</h2>
    </section>
  </article>
</main>
<footer>...</footer>

<!-- ✅ Live regions pour contenu dynamique -->
<div aria-live="polite" aria-atomic="true">
  {{ statusMessage() }}
</div>

<!-- ✅ Focus management -->
<dialog #modal (closed)="returnFocus()">
  <button (click)="modal.close()">Fermer</button>
</dialog>
```

### 10.2 Contraste et Couleurs

```scss
// ✅ Contraste minimum 4.5:1 pour texte normal
.text-primary {
  color: #1e293b; // Slate 800 sur fond blanc = ratio 12.63:1
}

// ✅ Ne pas utiliser la couleur seule pour transmettre l'information
.error-field {
  border-color: #ef4444; // Rouge
  border-width: 2px; // + épaisseur
  // + icône d'erreur
}
```

---

## 11. Anti-Patterns à Éviter

### 11.1 Signals

```typescript
// ❌ Mutate (déprécié)
this.items.mutate(arr => arr.push(item));
// ✅ Update avec spread
this.items.update(arr => [...arr, item]);

// ❌ Effect pour mettre à jour des signals
effect(() => {
  this.derived.set(this.source() * 2);
});
// ✅ Computed
readonly derived = computed(() => this.source() * 2);

// ❌ Signal dans une méthode
getData() {
  return signal(this.fetchData());
}
// ✅ Signal comme propriété de classe
readonly data = signal<Data | null>(null);
```

### 11.2 RxJS

```typescript
// ❌ Subscribe imbriqués
obs1.subscribe(a => {
  obs2.subscribe(b => {});
});
// ✅ Opérateurs
obs1.pipe(switchMap(a => obs2)).subscribe();

// ❌ Oublier unsubscribe
ngOnInit() {
  this.source$.subscribe();
}
// ✅ takeUntilDestroyed
this.source$.pipe(takeUntilDestroyed()).subscribe();
```

### 11.3 Composants

```typescript
// ❌ @Input/@Output (ancienne syntaxe)
@Input() value: string;
@Output() change = new EventEmitter();
// ✅ Fonctions input/output
readonly value = input.required<string>();
readonly change = output<string>();

// ❌ @HostBinding/@HostListener
@HostBinding('class.active') isActive: boolean;
// ✅ host dans le décorateur
host: { '[class.active]': 'isActive()' }

// ❌ standalone: true (redondant en Angular 21)
@Component({ standalone: true })
// ✅ Omettre (true par défaut)
@Component({})

// ❌ Logique dans le template
<span>{{ items.filter(i => i.active).length }}</span>
// ✅ Computed
readonly activeCount = computed(() => this.items().filter(i => i.active).length);
```

### 11.4 Architecture

```typescript
// ❌ Service non singleton importé dans un composant
@Component({
  providers: [UserService] // Nouvelle instance à chaque composant
})
// ✅ providedIn: 'root' dans le service
@Injectable({ providedIn: 'root' })

// ❌ Injection par constructeur
constructor(private service: MyService) {}
// ✅ inject()
private readonly service = inject(MyService);
```

---

## Checklist de Revue de Code

### Composant
- [ ] `changeDetection: OnPush`
- [ ] Utilise `input()` et `output()` (pas `@Input/@Output`)
- [ ] State local avec `signal()`
- [ ] Valeurs dérivées avec `computed()`
- [ ] Pas de logique complexe dans le template
- [ ] `track` utilisé avec `@for`

### Service
- [ ] `providedIn: 'root'` pour singletons
- [ ] Utilise `inject()` pour DI
- [ ] Signals pour état interne avec `.asReadonly()` pour exposition

### Templates
- [ ] Control flow moderne (`@if`, `@for`, `@switch`)
- [ ] Bindings `[class]` et `[style]` (pas ngClass/ngStyle)
- [ ] Labels et aria-labels pour accessibilité
- [ ] `data-testid` pour éléments testables

### RxJS
- [ ] `async` pipe ou `toSignal()` pour affichage
- [ ] `takeUntilDestroyed()` pour subscriptions manuelles
- [ ] Opérateurs appropriés (switchMap, exhaustMap, etc.)

---

*Dernière mise à jour: Janvier 2026 - Angular 21*
