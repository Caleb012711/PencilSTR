export type FinancingType = 'conventional' | 'dscr' | 'seller_carry';

export interface SeasonalityMonth {
  month: string;
  name: string;
  revenue: number;
  occupancy: number;
  adr: number;
  isPeak?: boolean;
}

export interface PropertyDeal {
  id: string;
  mlsNumber: string;
  title: string;
  location: string;
  marketName: string;
  elevation: string;
  price: number;
  originalPrice?: number;
  priceDrop?: number;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  imageAlt: string;
  imageGallery?: string[];
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  compScore?: number; // similarity score 0-100
  distanceMiles?: number;
  viewType?: string;
  permitDetails?: {
    number: string;
    jurisdiction: string;
    badgeText: string;
  };
  turnkey: boolean;
  baseAdr: number;
  minCompAdr: number;
  peakHighAdr: number;
  baseOccupancy: number; // e.g. 64%
  breakEvenOccupancy: number;
  topMarketOccupancy: number;
  seasonality: SeasonalityMonth[];
  hoaStatus: {
    statusText: string;
    section: string;
    isUnrestricted: boolean;
    warningNote?: string;
  };
  capitalStack: {
    loanPrincipal: number;
    downPayment: number;
    reserves: number;
    loanPercentage: number;
    downPercentage: number;
    reservesPercentage: number;
  };
  expenses: {
    propertyTaxesAnnual: number;
    insuranceAnnual: number;
    utilitiesMonthly: number;
    managementFeeRate: number; // e.g. 0.15
    platformFeeRate: number; // e.g. 0.03
    maintenanceCapExRate: number; // e.g. 0.05
    hoaFeeAnnual: number;
    cleaningFeePerStay: number;
  };
  financingPreset: {
    dscr: {
      interestRate: number; // e.g. 7.15
      downPaymentPercent: number; // 20
      amortizationYears: number; // 30
      points: number; // 1.5
    };
    conventional: {
      interestRate: number; // 6.85
      downPaymentPercent: number; // 20
      amortizationYears: number; // 30
      points: number; // 1.0
    };
    seller_carry: {
      interestRate: number; // 5.5
      downPaymentPercent: number; // 15
      amortizationYears: number; // 30
      balloonYears: number; // 5
      points: number; // 0
    };
  };
}

export interface CcrClauseAudit {
  clauseId: string;
  title: string;
  sectionCode: string;
  status: 'clear' | 'active' | 'noted' | 'warning' | 'prohibited';
  summary: string;
  verbatimExcerpt: string;
  riskAssessment: string;
  operatorRecommendation: string;
}

export interface UnderwritingMetrics {
  grossAnnualRevenue: number;
  cleaningRevenue: number;
  totalRevenue: number;
  operatingExpenses: number;
  noi: number;
  annualDebtService: number;
  monthlyDebtService: number;
  netCashFlowAnnual: number;
  netCashFlowMonthly: number;
  cashOnCashReturn: number;
  capRate: number;
  dscrRatio: number;
  totalCashRequired: number;
  totalMonthlyRevenue: number;
}
