import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimulationDto, SaveSimulationRequest, SimulationListResponse } from '../models/simulation.model';
import { AuthService } from './auth.service';
import { SimulationCalculator, SimulationData } from '../logic/simulation-calculator';

@Injectable({
    providedIn: 'root'
})
export class SimulationService {
    private readonly API_URL = 'http://localhost:5209/api/simulation';

    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);

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

    /**
     * Calculates simulation results from input parameters.
     * Returns all computed fiscal values (net, taxes, etc.)
     */
    calculateSimulation(params: Partial<SimulationData>): {
        netAnnual: number;
        socialContributions: number;
        ipp: number;
        corpTax: number;
        reserves: number;
    } {
        const data: SimulationData = {
            revenue: params.revenue || 0,
            grossSalaryMonthly: params.grossSalaryMonthly || 2000,
            insuranceAnnual: params.insuranceAnnual || 0,
            phoneMonthly: params.phoneMonthly || 0,
            internetMonthly: params.internetMonthly || 0,
            carMonthly: params.carMonthly || 0,
            mealVouchersMonthly: params.mealVouchersMonthly || 0,
            restaurantMonthly: params.restaurantMonthly || 0,
            pensionAnnual: params.pensionAnnual || 0,
            otherAnnual: params.otherAnnual || 0
        };

        return SimulationCalculator.calculate(data);
    }

    /**
     * Finds the required Revenue (Annual) to achieve the target Net Annual Income
     * using a binary search algorithm.
     */
    calculateRequiredRevenue(targetNet: number, params: Partial<SimulationDto>): number {
        // Base params with defaults if missing
        const data: SimulationData = {
            revenue: 0, // variable
            grossSalaryMonthly: params.grossSalaryMonthly || 2000,
            insuranceAnnual: params.insuranceAnnual || 0,
            phoneMonthly: params.phoneMonthly || 0,
            internetMonthly: params.internetMonthly || 0,
            carMonthly: params.carMonthly || 0,
            mealVouchersMonthly: params.mealVouchersMonthly || 0,
            restaurantMonthly: params.restaurantMonthly || 0,
            pensionAnnual: params.pensionAnnual || 0,
            otherAnnual: params.otherAnnual || 0
        };

        let low = targetNet; // Minimum revenue >= target net
        let high = targetNet * 5; // Heuristic upper bound
        let bestRevenue = high;

        // Binary Search (Max 50 iterations for precision)
        for (let i = 0; i < 50; i++) {
            const mid = (low + high) / 2;
            data.revenue = mid;

            // Using the imported static class
            const result = SimulationCalculator.calculate(data);

            if (Math.abs(result.netAnnual - targetNet) < 5) {
                return Math.ceil(mid);
            }

            if (result.netAnnual < targetNet) {
                low = mid;
            } else {
                bestRevenue = mid;
                high = mid;
            }
        }

        return Math.ceil(bestRevenue);
    }
}
