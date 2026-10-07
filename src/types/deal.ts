export type PipelineStage =
  | 'inbox'
  | 'underwriting'
  | 'due_diligence'
  | 'offer_sent'
  | 'under_contract'
  | 'acquired';

export type FinancingType = 'conventional' | 'dscr' | 'seller_carry' | 'subject_to';

export interface FinancingTerms {
  strategy: FinancingType;
  // Conventional & DSCR
  downPaymentPct: number;
  interestRate: number;
  amortizationYears: number;
  points: number;
  // Seller Financing
  balloonYears?: number;
  interestOnly?: boolean;
  sellerDownPct?: number;
  sellerInterestRate?: number;
  sellerCarryTerms?: {
    interestOnlyYears?: number;
    balloonYears?: number;
  };
  // Subject-To
  existingLoanBalance?: number;
  existingMonthlyPayment?: number;
  sellerGapNoteAmount?: number;
  sellerGapRate?: number;
  sellerGapTermYears?: number;
}

export interface OperatingExpenses {
  taxesAnnual: number;
  insuranceAnnual: number;
  utilitiesMonthly: number;
  wifiMonthly: number;
  hoaFeeMonthly: number;
  platformFeeRate: number; // e.g. 0.03 (Airbnb 3%)
  managementFeeRate: number; // e.g. 0.15 (15%)
  cleaningFeePerStay: number;
  maintenanceCapExRate: number; // e.g. 0.05 (5%)
}

export interface Citation {
  page_number: number;
  clause_section: string;
  exact_quote: string;
}

export interface AuditSummary {
  str_status: 'PERMITTED' | 'CONDITIONAL' | 'PROHIBITED';
  risk_rating: 'LOW' | 'MEDIUM' | 'HIGH';
  minimum_stay_days: number;
  parking_limit_vehicles: string;
  quiet_hours: string;
  amenity_fees: string;
  fines_schedule: string;
  citations: Citation[];
  document_name?: string;
  last_audited_at?: string;
}

export interface SeasonalityMonth {
  month: string;
  name: string;
  revenue: number;
  occupancy: number;
  adr: number;
  isPeak?: boolean;
}

export interface Deal {
  id: string;
  userId: string;
  mlsNumber: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  marketName: string;
  elevation?: string;
  price: number;
  originalPrice?: number;
  priceDrop?: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt?: number;
  imageUrl: string;
  imageAlt?: string;
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
  stage: PipelineStage;
  // Revenue Drivers
  baseAdr: number;
  minCompAdr: number;
  peakHighAdr: number;
  baseOccupancy: number; // e.g. 64%
  breakEvenOccupancy: number;
  topMarketOccupancy: number;
  seasonality: SeasonalityMonth[];
  // Financing
  financing: FinancingTerms;
  // Operating Expenses
  expenses: OperatingExpenses;
  // CC&R / HOA Audit
  audit: AuditSummary;
  // Actuals for Portfolio tracking (if acquired or historical)
  actuals?: {
    months: {
      monthKey: string; // "2025-01"
      monthName: string;
      underwrittenRevenue: number;
      realizedRevenue: number;
      realizedCleaning: number;
      actualOccupancy: number;
      actualAdr: number;
    }[];
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  dscrBadge: 'green' | 'amber' | 'red';
  breakEvenOccupancy: number;
  totalCashRequired: number;
  loanPrincipal: number;
  downPaymentDollars: number;
}

export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  isGuest: boolean;
  role: 'operator' | 'scout' | 'admin';
}
