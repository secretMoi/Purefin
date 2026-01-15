import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'simulation',
        loadComponent: () => import('./features/simulation/simulation.component').then(m => m.SimulationComponent)
    },
    { path: '', redirectTo: 'simulation', pathMatch: 'full' }
];
