
export interface SimulationRequest {
    totalRevenue: number;
    grossSalary: number;
    includeCar: boolean;
    includeMealVouchers: boolean;
    includeInternet: boolean;
    includeInsurance: boolean;
    includeAccountant: boolean;
}

export interface SimulationResult {
    companyRevenue: number;
    companyExpenses: number;
    companyTax: number;
    netCompanyProfit: number;

    personalGrossSalary: number;
    personalTax: number;
    personalSocialSecurity: number;
    personalNetSalary: number;

    totalPackageValue: number;
    appliedPerks: string[];
}
