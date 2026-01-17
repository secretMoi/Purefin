import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SimulationService } from '../../core/services/simulation.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-tjm-estimator',
    imports: [
        CommonModule,
        FormsModule,
        InputNumberModule,
        ButtonModule,
        CardModule,
        SliderModule,
        CheckboxModule,
        TooltipModule,
        AccordionModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './tjm-estimator.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TjmEstimatorComponent {
    simulationService = inject(SimulationService);
    router = inject(Router);
    messageService = inject(MessageService);

    // === Core Inputs ===
    targetNetMonthly = signal<number>(3000);
    daysWorkedPerYear = signal<number>(220);

    // === TVA Options ===
    isVatExempt = signal<boolean>(false); // Franchise TVA (< 25k CA)
    vatRate = signal<number>(21); // 21%, 6%, etc.

    // === Home Office Deductions ===
    useHomeOffice = signal<boolean>(false);
    homeOfficePercentage = signal<number>(20); // % of home used for business
    rentMonthly = signal<number>(800);
    electricityMonthly = signal<number>(100);
    heatingMonthly = signal<number>(80);
    waterMonthly = signal<number>(30);
    internetMonthly = signal<number>(50);

    // === Other Optimizations ===
    useCar = signal<boolean>(true);
    carMonthly = signal<number>(600);
    usePhone = signal<boolean>(true);
    phoneMonthly = signal<number>(50);
    useMealVouchers = signal<boolean>(true);
    mealVouchersMonthly = signal<number>(160);
    useRestaurant = signal<boolean>(true);
    restaurantMonthly = signal<number>(200);

    // === Salary Optimization ===
    grossSalaryMonthly = signal<number>(2500);

    // === Computed: Total Home Office Deductions ===
    homeOfficeDeductionsMonthly = computed(() => {
        if (!this.useHomeOffice()) return 0;
        const percentage = this.homeOfficePercentage() / 100;
        return (
            this.rentMonthly() * percentage +
            this.electricityMonthly() * percentage +
            this.heatingMonthly() * percentage +
            this.waterMonthly() * percentage +
            this.internetMonthly() * percentage
        );
    });

    homeOfficeDeductionsAnnual = computed(() => this.homeOfficeDeductionsMonthly() * 12);

    // === Computed: Total Expenses for Simulation ===
    totalExpensesMonthly = computed(() => {
        let total = 0;
        if (this.useCar()) total += this.carMonthly();
        if (this.usePhone()) total += this.phoneMonthly();
        if (this.useMealVouchers()) total += this.mealVouchersMonthly();
        if (this.useRestaurant()) total += this.restaurantMonthly();
        total += this.homeOfficeDeductionsMonthly();
        return total;
    });

    // === Computed: Required Revenue ===
    requiredRevenueAnnual = computed(() => {
        const netMonth = this.targetNetMonthly();
        const netYear = netMonth * 12;

        return this.simulationService.calculateRequiredRevenue(netYear, {
            grossSalaryMonthly: this.grossSalaryMonthly(),
            carMonthly: this.useCar() ? this.carMonthly() : 0,
            phoneMonthly: this.usePhone() ? this.phoneMonthly() : 0,
            internetMonthly: this.useHomeOffice() ? this.internetMonthly() : 50,
            mealVouchersMonthly: this.useMealVouchers() ? this.mealVouchersMonthly() : 0,
            restaurantMonthly: this.useRestaurant() ? this.restaurantMonthly() : 0,
            // Home office is added to "otherAnnual" as custom deduction
            otherAnnual: this.homeOfficeDeductionsAnnual()
        });
    });

    // === Computed: Required TJM ===
    requiredTjm = computed(() => {
        const rev = this.requiredRevenueAnnual();
        const days = this.daysWorkedPerYear();
        return days > 0 ? rev / days : 0;
    });

    // === Computed: TJM with VAT (for client display) ===
    requiredTjmWithVat = computed(() => {
        if (this.isVatExempt()) return this.requiredTjm();
        return this.requiredTjm() * (1 + this.vatRate() / 100);
    });

    // === Guides Data ===
    guides = [
        {
            icon: 'pi pi-percentage',
            title: 'TVA et Franchise',
            description: 'Si votre CA annuel est < 25 000€, vous pouvez opter pour la franchise TVA.',
            tip: 'Pas de TVA à facturer ni à récupérer = simplicité administrative.'
        },
        {
            icon: 'pi pi-home',
            title: 'Bureau à Domicile',
            description: 'Déduisez une partie de vos frais de logement proportionnelle à l\'usage professionnel.',
            tip: 'Standard: 10-20% pour un bureau dédié. Maximum défendable: ~30%.'
        },
        {
            icon: 'pi pi-car',
            title: 'Véhicule de Société',
            description: 'Une voiture électrique est 100% déductible et génère un ATN faible.',
            tip: 'Préférez un leasing opérationnel pour optimiser les charges.'
        },
        {
            icon: 'pi pi-wallet',
            title: 'Optimisation Salariale',
            description: 'Équilibrez salaire brut et dividendes pour minimiser l\'imposition globale.',
            tip: 'Salaire minimum ~45k€/an pour bénéficier du taux réduit d\'ISOC (20%).'
        }
    ];

    // === Methods ===
    createSimulation() {
        // Build base parameters
        const baseParams = {
            revenue: Math.round(this.requiredRevenueAnnual()),
            grossSalaryMonthly: this.grossSalaryMonthly(),
            insuranceAnnual: 2000,
            phoneMonthly: this.usePhone() ? this.phoneMonthly() : 0,
            internetMonthly: this.useHomeOffice() ? this.internetMonthly() : 50,
            carMonthly: this.useCar() ? this.carMonthly() : 0,
            mealVouchersMonthly: this.useMealVouchers() ? this.mealVouchersMonthly() : 0,
            restaurantMonthly: this.useRestaurant() ? this.restaurantMonthly() : 0,
            pensionAnnual: 3000,
            otherAnnual: Math.round(this.homeOfficeDeductionsAnnual())
        };

        // Calculate derived values using the simulation logic
        const result = this.simulationService.calculateSimulation(baseParams);

        // Build complete simulation request with calculated values
        const simulationParams = {
            name: `Estimateur TJM - ${new Date().toLocaleDateString('fr-BE')}`,
            ...baseParams,
            calculatedNetAnnual: result.netAnnual,
            calculatedSocialContributions: result.socialContributions,
            calculatedIPP: result.ipp,
            calculatedCorpTax: result.corpTax,
            calculatedReserves: result.reserves
        };

        // Save simulation via service
        this.simulationService.saveSimulation(simulationParams).subscribe({
            next: (savedResult) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Simulation créée',
                    detail: 'Votre simulation a été créée avec succès.'
                });

                // Navigate to simulation with the new ID
                this.router.navigate(['/'], {
                    state: {
                        loadSimulationId: savedResult.id,
                        fromEstimator: true
                    }
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de créer la simulation. Vérifiez que vous êtes connecté.'
                });

                // Fallback: navigate anyway with prefill data
                this.router.navigate(['/'], {
                    state: {
                        prefillData: baseParams,
                        fromEstimator: true
                    }
                });
            }
        });
    }

    viewDetails() {
        // Navigate to main simulation with prefill data (without saving)
        this.router.navigate(['/'], {
            state: {
                prefillData: {
                    revenue: Math.round(this.requiredRevenueAnnual()),
                    grossSalaryMonthly: this.grossSalaryMonthly(),
                    phoneMonthly: this.usePhone() ? this.phoneMonthly() : 0,
                    internetMonthly: this.useHomeOffice() ? this.internetMonthly() : 50,
                    carMonthly: this.useCar() ? this.carMonthly() : 0,
                    mealVouchersMonthly: this.useMealVouchers() ? this.mealVouchersMonthly() : 0,
                    restaurantMonthly: this.useRestaurant() ? this.restaurantMonthly() : 0,
                    otherAnnual: Math.round(this.homeOfficeDeductionsAnnual())
                },
                fromEstimator: true
            }
        });
    }
}
