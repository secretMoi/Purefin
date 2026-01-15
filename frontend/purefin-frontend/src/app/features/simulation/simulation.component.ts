
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { SimulationService } from './simulation.service';
import { SimulationRequest, SimulationResult } from './models/simulation.models';

@Component({
    selector: 'app-simulation',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputNumberModule,
        CheckboxModule,
        CardModule,
        TableModule,
        DividerModule
    ],
    template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-slate-800">Financial Simulation</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Input Form -->
        <div class="md:col-span-4">
          <p-card header="Parameters" styleClass="h-full">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="font-semibold text-slate-600">Company Annual Revenue (€)</label>
                <p-inputNumber 
                    [(ngModel)]="request.totalRevenue" 
                    mode="decimal" 
                    [minFractionDigits]="2" 
                    [maxFractionDigits]="2" 
                    suffix=" €"
                    class="w-full" styleClass="w-full" />
              </div>

              <div class="flex flex-col gap-2">
                <label class="font-semibold text-slate-600">Gross Monthly Salary (€)</label>
                <p-inputNumber 
                    [(ngModel)]="request.grossSalary" 
                    mode="decimal" 
                    [minFractionDigits]="2" 
                    [maxFractionDigits]="2" 
                    suffix=" €"
                    class="w-full" styleClass="w-full" />
              </div>

              <p-divider></p-divider>
              <h3 class="font-semibold text-slate-700">Perks & Benefits</h3>
              
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <p-checkbox [(ngModel)]="request.includeCar" [binary]="true" inputId="car"></p-checkbox>
                    <label for="car">Company Car</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-checkbox [(ngModel)]="request.includeMealVouchers" [binary]="true" inputId="meal"></p-checkbox>
                    <label for="meal">Meal Vouchers</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-checkbox [(ngModel)]="request.includeInternet" [binary]="true" inputId="net"></p-checkbox>
                    <label for="net">Internet Allowance</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-checkbox [(ngModel)]="request.includeInsurance" [binary]="true" inputId="ins"></p-checkbox>
                    <label for="ins">Hospitalization Insurance</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-checkbox [(ngModel)]="request.includeAccountant" [binary]="true" inputId="acc"></p-checkbox>
                    <label for="acc">Accountant Fees</label>
                </div>
              </div>

              <div class="mt-4">
                <p-button label="Calculate Simulation" icon="pi pi-calculator" (onClick)="calculate()" [loading]="isLoading()" styleClass="w-full"></p-button>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Results -->
        <div class="md:col-span-8">
            @if (result(); as res) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <p-card header="Company Metrics" styleClass="h-full bg-blue-50">
                        <div class="flex flex-col gap-2">
                            <div class="flex justify-between">
                                <span>Total Revenue:</span>
                                <span class="font-bold">{{ res.companyRevenue | currency:'EUR' }}</span>
                            </div>
                            <div class="flex justify-between text-red-600">
                                <span>Total Expenses:</span>
                                <span>-{{ res.companyExpenses | currency:'EUR' }}</span>
                            </div>
                            <div class="flex justify-between text-red-600">
                                <span>Corporate Tax (20%):</span>
                                <span>-{{ res.companyTax | currency:'EUR' }}</span>
                            </div>
                            <p-divider></p-divider>
                            <div class="flex justify-between text-lg text-blue-800 font-bold">
                                <span>Net Profit (Reserves):</span>
                                <span>{{ res.netCompanyProfit | currency:'EUR' }}</span>
                            </div>
                        </div>
                    </p-card>

                    <p-card header="Director Personal" styleClass="h-full bg-green-50">
                         <div class="flex flex-col gap-2">
                            <div class="flex justify-between">
                                <span>Gross Salary:</span>
                                <span class="font-bold">{{ res.personalGrossSalary | currency:'EUR' }}</span>
                            </div>
                            <div class="flex justify-between text-red-600">
                                <span>ONSS (13.07%):</span>
                                <span>-{{ res.personalSocialSecurity | currency:'EUR' }}</span>
                            </div>
                             <div class="flex justify-between text-red-600">
                                <span>Income Tax (IPP):</span>
                                <span>-{{ res.personalTax | currency:'EUR' }}</span>
                            </div>
                            <p-divider></p-divider>
                            <div class="flex justify-between text-lg text-green-800 font-bold">
                                <span>Net Salary:</span>
                                <span>{{ res.personalNetSalary | currency:'EUR' }}</span>
                            </div>
                        </div>
                    </p-card>
                </div>
                
                <p-card header="Total Optimization Summary">
                    <div class="text-center p-4">
                        <div class="text-slate-500 mb-1">Total Package Value (incl. Perks)</div>
                        <div class="text-4xl font-bold text-slate-800">{{ res.totalPackageValue | currency:'EUR' }}</div>
                        <div class="text-sm text-slate-400 mt-2">Active Perks: {{ res.appliedPerks.join(', ') || 'None' }}</div>
                    </div>
                </p-card>
            } @else {
                <div class="flex items-center justify-center h-full text-slate-400 bg-white rounded-xl border border-dashed border-slate-300 min-h-[400px]">
                    <div class="text-center">
                        <i class="pi pi-chart-bar text-4xl mb-4"></i>
                        <p>Fill parameters and click "Calculate" to see results.</p>
                    </div>
                </div>
            }
        </div>
      </div>
    </div>
  `
})
export class SimulationComponent {
    private simulationService = inject(SimulationService);

    request: SimulationRequest = {
        totalRevenue: 100000,
        grossSalary: 2500,
        includeCar: false,
        includeMealVouchers: false,
        includeInternet: false,
        includeInsurance: false,
        includeAccountant: true
    };

    result = signal<SimulationResult | null>(null);
    isLoading = signal<boolean>(false);

    calculate() {
        this.isLoading.set(true);
        this.simulationService.calculate(this.request).subscribe({
            next: (res) => {
                this.result.set(res);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }
}
