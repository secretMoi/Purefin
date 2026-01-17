import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SimulationService } from '../../core/services/simulation.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SliderModule } from 'primeng/slider';

@Component({
    selector: 'app-tjm-estimator',
    standalone: true,
    imports: [CommonModule, FormsModule, InputNumberModule, ButtonModule, CardModule, SliderModule],
    templateUrl: './tjm-estimator.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TjmEstimatorComponent {
    simulationService = inject(SimulationService);
    router = inject(Router);

    // Inputs
    targetNetMonthly = signal<number>(3000);
    daysWorkedPerYear = signal<number>(220); // Standard roughly

    // Advanced Params (hidden by default or simplified)
    dailyExpenses = signal<number>(0); // e.g. displacement cost if non-billable? Usually captured in expenses.

    // Computation
    requiredRevenueAnnual = computed(() => {
        const netMonth = this.targetNetMonthly();
        const netYear = netMonth * 12;

        // Use service to find revenue needed for this net
        // We assume default standard expenses (car etc) 
        // Or we could let user toggle "With Car" / "Without Car"

        return this.simulationService.calculateRequiredRevenue(netYear, {
            grossSalaryMonthly: 2500, // Reasonable default assumption optimization
            carMonthly: 600, // Assume optimized with car
            phoneMonthly: 50,
            internetMonthly: 50,
            mealVouchersMonthly: 160,
            restaurantMonthly: 200
        });
    });

    requiredTjm = computed(() => {
        const rev = this.requiredRevenueAnnual();
        const days = this.daysWorkedPerYear();
        return days > 0 ? rev / days : 0;
    });

    viewDetails() {
        this.router.navigate(['/'], {
            state: {
                prefillRevenue: this.requiredRevenueAnnual()
            }
        });
    }
}
