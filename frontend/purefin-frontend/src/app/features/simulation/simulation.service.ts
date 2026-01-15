
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimulationRequest, SimulationResult } from './models/simulation.models';

@Injectable({
    providedIn: 'root'
})
export class SimulationService {
    private http = inject(HttpClient);
    // Assuming Backend is running on https://localhost:7198 as per usual .NET default or updated port
    // I will need to verify later, but for now using a placeholder or common default
    private apiUrl = 'http://localhost:5209/api/simulation';

    calculate(request: SimulationRequest): Observable<SimulationResult> {
        return this.http.post<SimulationResult>(`${this.apiUrl}/calculate`, request);
    }
}
