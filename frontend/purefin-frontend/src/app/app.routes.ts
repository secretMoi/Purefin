import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/simulation/simulation.component').then(m => m.SimulationComponent)
    }
];