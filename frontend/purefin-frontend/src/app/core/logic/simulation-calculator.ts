export interface SimulationData {
    revenue: number;
    grossSalaryMonthly: number;
    insuranceAnnual: number;
    phoneMonthly: number;
    internetMonthly: number;
    carMonthly: number;
    mealVouchersMonthly: number;
    restaurantMonthly: number;
    pensionAnnual: number;
    otherAnnual: number;
}

export interface SimulationResult {
    revenue: number;
    totalCompanyExpenses: number;
    taxableProfit: number;
    corpTax: number;
    reserves: number;

    grossSalaryAnnual: number;
    socialContributions: number;
    professionalExpensesPersonal: number;
    taxableIncome: number;
    ipp: number;

    netAnnual: number;
    netMonthly: number;
}

export class SimulationCalculator {

    static calculate(data: SimulationData): SimulationResult {
        const grossSalaryAnnual = data.grossSalaryMonthly * 12;

        // --- Personal Side ---

        // Social Contributions (Simplification ~20.5%)
        const socialContributions = grossSalaryAnnual * 0.205;

        // Professional Expenses (Forfaitaires)
        // 3% limited to ~2990 (approx 2024 limit)
        let profExp = grossSalaryAnnual * 0.03;
        if (profExp > 2990) profExp = 2990;
        const professionalExpensesPersonal = profExp;

        // ATN (Avantage Toute Nature) - Estimations
        // Car: ~2000? Phone: ~48? Internet: ~60?
        // Let's assume some defaults if used as 'Advantages'
        // Simplified Logic: if user puts phone/car in company, they get ATN.
        // For now, let's keep ATN simple/zero or heuristic to match previous component logic if possible.
        // In component: this.atnCarAnnual() + this.atnPhoneAnnual() + this.atnInternetAnnual()
        // Let's estimate them based on inputs.
        // If car > 0, assume ATN = 1400 + (val/10)? Or just fixed standard.
        // Let's use standard fixed lows for optimization scenario:
        const atnCar = data.carMonthly > 0 ? 1500 : 0; // standard low
        const atnPhone = data.phoneMonthly > 0 ? 48 : 0;
        const atnInternet = data.internetMonthly > 0 ? 60 : 0;
        const totalAtnAnnual = atnCar + atnPhone + atnInternet;

        // Taxable Income
        const taxableIncome = Math.max(0, grossSalaryAnnual + totalAtnAnnual - socialContributions - professionalExpensesPersonal);

        // IPP Calculation
        const ipp = this.calculateIPP(taxableIncome);

        // Net Personal (Cash)
        const netPersonal = grossSalaryAnnual - socialContributions - ipp;


        // --- Company Side ---

        const restaurantAnnual = data.restaurantMonthly * 12;
        const restaurantDeductible = restaurantAnnual * 0.69;
        const restaurantDNA = restaurantAnnual * 0.31; // DNA added back to profit

        const totalDeductiblesAnnual =
            data.insuranceAnnual +
            (data.phoneMonthly * 12) +
            (data.internetMonthly * 12) +
            (data.carMonthly * 12) +
            (data.mealVouchersMonthly * 12) +
            restaurantAnnual +
            data.pensionAnnual +
            data.otherAnnual;

        const totalCompanyExpenses = grossSalaryAnnual + totalDeductiblesAnnual;

        const baseProfit = data.revenue - totalCompanyExpenses;
        const taxableProfit = Math.max(0, baseProfit + restaurantDNA);

        // ISOC Calculation
        const minSalaryRule = 45000;
        const isReducedRate = grossSalaryAnnual >= minSalaryRule;
        let corpTax = 0;

        if (isReducedRate) {
            if (taxableProfit <= 100000) {
                corpTax = taxableProfit * 0.20;
            } else {
                corpTax = (100000 * 0.20) + ((taxableProfit - 100000) * 0.25);
            }
        } else {
            corpTax = taxableProfit * 0.25;
        }

        const reserves = data.revenue - totalCompanyExpenses - corpTax;

        // Total Net "In Pocket" (Salary Net + Reserves)
        // Usually reserves need Dividend Tax (15-30%). 
        // For "Optimized" view, we often show total potential wealth.
        // Component logic was: NetAnnual = NetSalaryAnnual + Reserves.
        const netAnnual = netPersonal + reserves;
        const netMonthly = netAnnual / 12;

        return {
            revenue: data.revenue,
            totalCompanyExpenses,
            taxableProfit,
            corpTax,
            reserves,
            grossSalaryAnnual,
            socialContributions,
            professionalExpensesPersonal,
            taxableIncome,
            ipp,
            netAnnual,
            netMonthly
        };
    }

    private static calculateIPP(income: number): number {
        let tax = 0;
        let taxable = income;

        // Brackets 2024
        const b1 = 15200;
        const b2 = 26830;
        const b3 = 46440;

        if (taxable > b3) {
            tax += (taxable - b3) * 0.50;
            taxable = b3;
        }
        if (taxable > b2) {
            tax += (taxable - b2) * 0.45;
            taxable = b2;
        }
        if (taxable > b1) {
            tax += (taxable - b1) * 0.40;
            taxable = b1;
        }
        if (taxable > 0) {
            tax += taxable * 0.25;
        }

        // Tax Credit
        const exemption = 10160;
        const taxCredit = exemption * 0.25;
        tax = Math.max(0, tax - taxCredit);

        // Communal Tax ~7%
        tax = tax * 1.07;

        return tax;
    }
}
