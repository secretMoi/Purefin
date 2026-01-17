# Gemini Guidelines

Ce fichier définit les règles et références que l'IA doit suivre pour ce projet.

## Documentation de Référence

L'IA DOIT consulter et appliquer les guidelines définies dans :

- **[AGENTS.md](../AGENTS.md)** - Guide complet des bonnes pratiques Angular 21+
  - Signals & État Réactif
  - RxJS & Gestion Asynchrone
  - Architecture & Structure du Projet
  - Séparation HTML/TS
  - Composants & Directives
  - Services & Injection de Dépendances
  - Formulaires
  - Testing
  - Performance
  - Accessibilité

## Stack Technique

- **Frontend**: Angular 21+ avec signals, standalone components, PrimeNG
- **Backend**: .NET 10
- **Database**: PostgreSQL
- **Styling**: TailwindCSS

## Règles Prioritaires

1. **Toujours utiliser `inject()`** au lieu de l'injection par constructeur
2. **Toujours utiliser `ChangeDetectionStrategy.OnPush`**
3. **Utiliser `signal()` pour l'état local**, `computed()` pour les valeurs dérivées
4. **Utiliser `input()` et `output()`** au lieu de `@Input()` et `@Output()`
5. **Ne pas mettre `standalone: true`** (c'est le défaut en Angular 21)
6. **Utiliser le control flow moderne** (`@if`, `@for`, `@switch`)
7. **Éviter la logique dans les templates**
8. **Toujours utiliser `track` avec `@for`**
