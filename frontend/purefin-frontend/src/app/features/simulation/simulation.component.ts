import { Component, computed, signal, effect, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import 'chart.js/auto';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    CardModule,
    TooltipModule,
    ChartModule,
    ButtonModule,
    DividerModule
  ],
  templateUrl: './simulation.component.html',
  styleUrls: [] // Using Tailwind classes directly in HTML
})
export class SimulationComponent implements OnInit {

  // --- Inputs ---
  
  // Revenues
  revenue = signal<number>(120000);
  grossSalaryMonthly = signal<number>(4000);

  // Deductibles
  insuranceAnnual = signal<number>(2000);
  phoneMonthly = signal<number>(50);
  internetMonthly = signal<number>(50);
  carMonthly = signal<number>(600);
  mealVouchersMonthly = signal<number>(160);
  restaurantMonthly = signal<number>(200);
  pensionAnnual = signal<number>(3000);
  otherAnnual = signal<number>(5000);

  // --- Calculations (Belgian Fiscal Rules 2024/2025) ---

  // Annualized Values
  grossSalaryAnnual = computed(() => this.grossSalaryMonthly() * 12);
  
  // ATN (Benefits in Kind) Estimation - Increases Personal Tax Base
  // Simplified estimations if company pays for these
  atnPhone = computed(() => this.phoneMonthly() > 0 ? 48 : 0); // 4€/month
  atnInternet = computed(() => this.internetMonthly() > 0 ? 60 : 0); // 5€/month
  // ATN Car: Simplified estimation based on monthly cost. 
  // Real formula requires CO2/Catalogue Value/Age. 
  // Assumption: Electric car ~ high value but low emission. 
  // Let's assume ATN is roughly 15% of the monthly lease cost as a proxy for the 'benefit'.
  // Or better, a standard minimum + value. 
  // For a 600€ lease, let's estimate ATN at ~150€/month (~1800/year).
  atnCar = computed(() => this.carMonthly() > 0 ? 1800 : 0); 

  totalAtnAnnual = computed(() => this.atnPhone() + this.atnInternet() + this.atnCar());

  // Social Contributions (Independent)
  // Base = Gross + ATN
  // Rate ~20.5%
  // Max Ceiling 2024: Income > ~107,000, max contribution ~19,000.
  // Admin fees ~4% usually added.
  socialContributions = computed(() => {
    const base = this.grossSalaryAnnual() + this.totalAtnAnnual();
    const rate = 0.205;
    const ceilingIncome = 107000; 
    
    let contribution = 0;
    if (base > ceilingIncome) {
        contribution = ceilingIncome * rate;
    } else {
        contribution = base * rate;
    }
    
    // Add admin fees (~4% of the contribution)
    return contribution * 1.04;
  });

  // Professional Expenses (Frais Professionnels Forfaitaires) - Personal Side
  // 3% of (Gross - SocCont), Max ~2,910€ (2024)
  professionalExpensesPersonal = computed(() => {
    const base = this.grossSalaryAnnual() + this.totalAtnAnnual() - this.socialContributions();
    const calculated = base * 0.03;
    return Math.min(calculated, 2910);
  });

  // Taxable Income (Personal)
  // Gross + ATN - SocCont - ProfExpenses
  taxableIncome = computed(() => {
    const val = this.grossSalaryAnnual() + this.totalAtnAnnual() - this.socialContributions() - this.professionalExpensesPersonal();
    return Math.max(0, val);
  });

  // IPP (Personal Income Tax)
  ipp = computed(() => {
    let income = this.taxableIncome();
    let tax = 0;

    // Brackets 2024 (Indexed)
    // 0 - 15,200: 25%
    // 15,200 - 26,830: 40%
    // 26,830 - 46,440: 45%
    // > 46,440: 50%
    
    const b1 = 15200;
    const b2 = 26830;
    const b3 = 46440;

    if (income > b3) {
        tax += (income - b3) * 0.50;
        income = b3;
    }
    if (income > b2) {
        tax += (income - b2) * 0.45;
        income = b2;
    }
    if (income > b1) {
        tax += (income - b1) * 0.40;
        income = b1;
    }
    if (income > 0) {
        tax += income * 0.25;
    }

    // Tax Free Allowance (Quotité Exemptée)
    // Base ~10,160. Tax credit = Base * 25% (lowest bracket)
    const exemption = 10160;
    const taxCredit = exemption * 0.25;
    
    tax = Math.max(0, tax - taxCredit);

    // Municipal Tax (Taxe Communale) ~7%
    tax = tax * 1.07;

    return tax;
  });

  // Net Personal Income
  // Formula: Gross - SocCont - IPP
  // Note: ATN is virtual, it increased the tax base, but is not "cash" deducted from salary.
  // However, if the company pays the ATN items, the user "gets" them. 
  // "Net en poche" usually refers to Cash.
  netAnnual = computed(() => {
    return this.grossSalaryAnnual() - this.socialContributions() - this.ipp();
  });

  netMonthly = computed(() => {
    return this.netAnnual() / 12;
  });


  // --- Company Situation ---

  // Deductibles (Company Expenses)
  // Note: Some are partially deductible (DNA - Dépenses Non Admises)
  
  // Meal Vouchers: Employer cost input ~160.
  // Deductible: 2€/ticket. Employer contribution max ~6.91. 
  // If input is 160, let's assume fully deductible for simplicity or apply slight DNA.
  // Actually, usually 2€/ticket is deductible, rest is DNA? No, 2€/ticket is Tax Deductible Amount per ticket? 
  // Correction: Employer contribution (max 6.91) is deductible.
  // Let's assume input is fully compliant.
  
  // Restaurant: 69% Deductible. 31% DNA.
  restaurantDeductible = computed(() => (this.restaurantMonthly() * 12) * 0.69);
  restaurantDNA = computed(() => (this.restaurantMonthly() * 12) * 0.31);

  // Car: Assume 100% deductible (Electric/Hybrid optim)
  // Phone/Internet: 100% Deductible (Professional use)
  
  totalDeductiblesAnnual = computed(() => {
    // Cash out for company
    return this.insuranceAnnual() + 
           (this.phoneMonthly() * 12) +
           (this.internetMonthly() * 12) +
           (this.carMonthly() * 12) +
           (this.mealVouchersMonthly() * 12) +
           (this.restaurantMonthly() * 12) + // Full cash out
           this.pensionAnnual() + 
           this.otherAnnual();
  });

  // Total Cash Expenses for Company
  totalCompanyExpenses = computed(() => {
    // Gross Salary + Social Contributions (if company pays? No, usually personal debt but company can advance via account current)
    // In this model, Gross Salary is the cost. Soc Contribs are paid by individual from Gross.
    return this.grossSalaryAnnual() + this.totalDeductiblesAnnual();
  });

  // Taxable Profit (Base Imposable ISOC)
  // Revenue - Expenses + DNA
  taxableProfit = computed(() => {
    const profit = this.revenue() - this.totalCompanyExpenses();
    // Add back DNA
    const dna = this.restaurantDNA(); // + others if any
    return Math.max(0, profit + dna);
  });

  // ISOC (Corporate Tax)
  corpTax = computed(() => {
    const profit = this.taxableProfit();
    let tax = 0;
    
    // Reduced Rate Condition: Salary >= 45,000 (standard rule)
    // Or Salary >= Result (if Result < 45k)
    // Let's use strict 45k rule for simplicity or check logic.
    const minSalaryRule = 45000;
    const isReducedRate = this.grossSalaryAnnual() >= minSalaryRule;

    if (isReducedRate) {
        // 20% on first 100k
        if (profit <= 100000) {
            tax = profit * 0.20;
        } else {
            tax = (100000 * 0.20) + ((profit - 100000) * 0.25);
        }
    } else {
        // Standard 25%
        tax = profit * 0.25;
    }
    
    return tax;
  });

  reserves = computed(() => {
    // What is left in company after paying Expenses and ISOC
    // Starting Cash: Revenue
    // Cash Out: Expenses (Salary + Deductibles)
    // Cash Out: ISOC
    return this.revenue() - this.totalCompanyExpenses() - this.corpTax();
  });

  // --- Charts Data ---
  
  chartDataPie: any;
  chartOptionsPie: any;
  chartDataBar: any;
  chartOptionsBar: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      this.updateCharts();
    });
  }

  ngOnInit() {
    this.initChartOptions();
    this.updateCharts();
  }

  initChartOptions() {
      if (isPlatformBrowser(this.platformId)) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.chartOptionsPie = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    },
                    position: 'bottom'
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        this.chartOptionsBar = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        color: '#e5e7eb',
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: '#e5e7eb',
                        drawBorder: false
                    }
                }
            }
        };
      }
  }

  updateCharts() {
      if (isPlatformBrowser(this.platformId)) {
        const documentStyle = getComputedStyle(document.documentElement);
        const colorNet = '#10b981'; // Emerald 500
        const colorSoc = '#f59e0b'; // Amber 500
        const colorIPP = '#64748b'; // Slate 500
        const colorExp = '#3b82f6'; // Blue 500
        const colorTax = '#1e293b'; // Slate 800
        const colorRes = '#14b8a6'; // Teal 500
        
        // Pie Chart: Distribution of Revenue
        this.chartDataPie = {
            labels: ['Salaire Net', 'Cotisations Soc.', 'IPP', 'Frais Déductibles', 'Impôt Société', 'Réserves'],
            datasets: [
                {
                    data: [
                        Math.round(this.netAnnual()),
                        Math.round(this.socialContributions()),
                        Math.round(this.ipp()),
                        Math.round(this.totalDeductiblesAnnual()),
                        Math.round(this.corpTax()),
                        Math.round(this.reserves())
                    ],
                    backgroundColor: [
                        colorNet,
                        colorSoc,
                        colorIPP,
                        colorExp,
                        colorTax,
                        colorRes
                    ],
                    hoverBackgroundColor: [
                        colorNet,
                        colorSoc,
                        colorIPP,
                        colorExp,
                        colorTax,
                        colorRes
                    ]
                }
            ]
        };

        // Bar Chart: Comparison Personal vs Company (Simplified view)
        // "Personnel" = Net Income
        // "Société" = Reserves + Expenses (benefit) ? Or just Reserves?
        // Let's mimic the screenshot: Personnel (Net) vs Société (Orange/Green bar).
        // Let's do:
        // Personnel: Net + IPP + SocCont (Total Cost)
        // Société: Reserves + ISOC + Expenses
        
        this.chartDataBar = {
            labels: ['Personnel', 'Société'],
            datasets: [
                {
                    label: 'Revenu Net / Réserves',
                    backgroundColor: colorNet,
                    data: [this.netAnnual(), this.reserves()]
                },
                {
                    label: 'Charges / Taxes',
                    backgroundColor: colorSoc,
                    data: [this.socialContributions() + this.ipp(), this.corpTax() + this.totalDeductiblesAnnual()]
                }
            ]
        };
      }
  }
}
