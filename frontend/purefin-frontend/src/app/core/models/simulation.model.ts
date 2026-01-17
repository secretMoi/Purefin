export interface SimulationDto {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string | null;

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

    calculatedNetAnnual: number;
    calculatedSocialContributions: number;
    calculatedIPP: number;
    calculatedCorpTax: number;
    calculatedReserves: number;
}

export interface SaveSimulationRequest {
    id?: string | null;
    name: string;

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

    calculatedNetAnnual: number;
    calculatedSocialContributions: number;
    calculatedIPP: number;
    calculatedCorpTax: number;
    calculatedReserves: number;
}

export interface SimulationListResponse {
    simulations: SimulationDto[];
    totalCount: number;
}
