import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimulationDto, SaveSimulationRequest, SimulationListResponse } from '../models/simulation.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class SimulationService {
    private readonly API_URL = 'http://localhost:5209/api/simulation';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        });
    }

    getSimulations(): Observable<SimulationListResponse> {
        return this.http.get<SimulationListResponse>(this.API_URL, {
            headers: this.getHeaders()
        });
    }

    getSimulation(id: string): Observable<SimulationDto> {
        return this.http.get<SimulationDto>(`${this.API_URL}/${id}`, {
            headers: this.getHeaders()
        });
    }

    saveSimulation(request: SaveSimulationRequest): Observable<SimulationDto> {
        return this.http.post<SimulationDto>(this.API_URL, request, {
            headers: this.getHeaders()
        });
    }

    deleteSimulation(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`, {
            headers: this.getHeaders()
        });
    }
}
