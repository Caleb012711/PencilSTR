import { Deal, FinancingTerms, OperatingExpenses, UnderwritingMetrics } from '../types/deal';
import { DEMO_DEALS } from '../mock/demoDeals';

/**
 * Calculates monthly mortgage payment (Principal & Interest)
 */
export function calculateMonthlyMortgage(
  principal: number,
  annualInterestRatePct: number,
  amortizationYears: number
): number {
  if (principal <= 0) return 0;
  if (annualInterestRatePct <= 0) return principal / (Math.max(1, amortizationYears) * 12);
  const monthlyRate = (annualInterestRatePct / 100) / 12;
  const numberOfPayments = Math.max(1, amortizationYears * 12);
  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  if (factor === 1) return principal / numberOfPayments;
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Executes comprehensive, real-time client-side underwriting calculations.
 * Completely defensive against undefined deals or missing properties.
 */
export function calculateUnderwriteMetrics(
  deal?: Deal | any,
  overrides?: {
    adr?: number;
    occupancy?: number;
    purchasePrice?: number;
    financing?: Partial<FinancingTerms>;
    expenses?: Partial<OperatingExpenses>;
  }
): UnderwritingMetrics {
  const fallbackDeal = DEMO_DEALS[0];
  const safeDeal = deal || fallbackDeal;

  const price = overrides?.purchasePrice ?? safeDeal?.price ?? 625000;
  const adr = overrides?.adr ?? safeDeal?.baseAdr ?? 485;
  const occupancyPct = overrides?.occupancy ?? safeDeal?.baseOccupancy ?? 64;

  const defaultFinancing: FinancingTerms = {
    strategy: 'dscr',
    downPaymentPct: 20,
    interestRate: 7.15,
    amortizationYears: 30,
    points: 1.25,
  };

  const financing: FinancingTerms = {
    ...defaultFinancing,
    ...(safeDeal?.financing || {}),
    ...(overrides?.financing || {}),
  };

  const defaultExpenses: OperatingExpenses = {
    taxesAnnual: 4800,
    insuranceAnnual: 2800,
    utilitiesMonthly: 390,
    wifiMonthly: 85,
    hoaFeeMonthly: 100,
    platformFeeRate: 0.03,
    managementFeeRate: 0.15,
    cleaningFeePerStay: 185,
    maintenanceCapExRate: 0.05,
  };

  const expenses: OperatingExpenses = {
    ...defaultExpenses,
    ...(safeDeal?.expenses || {}),
    ...(overrides?.expenses || {}),
  };

  const occRate = Math.min(Math.max(occupancyPct / 100, 0.05), 0.98);
  const nightsBooked = Math.round(365 * occRate);
  const avgStayNights = 3.2;
  const turnsCount = Math.max(1, Math.round(nightsBooked / avgStayNights));

  // 1. Gross Revenue
  const grossRent = nightsBooked * adr;
  const cleaningRevenue = turnsCount * (expenses.cleaningFeePerStay || 185);
  const totalRevenue = grossRent + cleaningRevenue;

  // 2. Operating Expenses
  const platformFee = grossRent * (expenses.platformFeeRate || 0.03);
  const managementFee = grossRent * (expenses.managementFeeRate || 0.15);
  const cleaningExpense = cleaningRevenue; // pass-through
  const propertyTaxes = expenses.taxesAnnual || 4800;
  const insurance = expenses.insuranceAnnual || 2800;
  const utilities = (expenses.utilitiesMonthly || 380) * 12;
  const wifi = (expenses.wifiMonthly || 90) * 12;
  const hoa = (expenses.hoaFeeMonthly || 0) * 12;
  const maintenanceCapEx = grossRent * (expenses.maintenanceCapExRate || 0.05);

  const operatingExpenses =
    platformFee +
    managementFee +
    cleaningExpense +
    propertyTaxes +
    insurance +
    utilities +
    wifi +
    hoa +
    maintenanceCapEx;

  // Net Operating Income (NOI)
  const noi = totalRevenue - operatingExpenses;

  // 3. Debt Service Calculation by Strategy
  let loanPrincipal = 0;
  let downPaymentDollars = 0;
  let monthlyDebtService = 0;
  let totalCashRequired = 0;

  if (financing.strategy === 'conventional' || financing.strategy === 'dscr') {
    const downPct = financing.downPaymentPct ?? 20;
    downPaymentDollars = price * (downPct / 100);
    loanPrincipal = Math.max(0, price - downPaymentDollars);
    const pointsCost = loanPrincipal * ((financing.points || 1.25) / 100);
    const estimatedClosing = price * 0.02 + pointsCost;
    const reserves = 35000;
    totalCashRequired = downPaymentDollars + estimatedClosing + reserves;

    monthlyDebtService = calculateMonthlyMortgage(
      loanPrincipal,
      financing.interestRate || 7.15,
      financing.amortizationYears || 30
    );
  } else if (financing.strategy === 'seller_carry') {
    const downPct = financing.sellerDownPct ?? 15;
    downPaymentDollars = price * (downPct / 100);
    loanPrincipal = Math.max(0, price - downPaymentDollars);
    const estimatedClosing = price * 0.015;
    const reserves = 25000;
    totalCashRequired = downPaymentDollars + estimatedClosing + reserves;

    const rate = financing.sellerInterestRate ?? 5.5;
    if (financing.interestOnly) {
      monthlyDebtService = (loanPrincipal * (rate / 100)) / 12;
    } else {
      monthlyDebtService = calculateMonthlyMortgage(
        loanPrincipal,
        rate,
        financing.amortizationYears || 30
      );
    }
  } else if (financing.strategy === 'subject_to') {
    // Subject-To: takeover existing loan balance + gap note to seller
    const existingBalance = financing.existingLoanBalance ?? price * 0.65;
    const existingPmt = financing.existingMonthlyPayment ?? 2100;
    const gapAmount = Math.max(0, price * 0.85 - existingBalance);
    const gapRate = financing.sellerGapRate ?? 6.0;
    const gapPmt = calculateMonthlyMortgage(gapAmount, gapRate, financing.sellerGapTermYears || 15);

    loanPrincipal = existingBalance + gapAmount;
    downPaymentDollars = price * 0.15; // 15% cash to seller
    totalCashRequired = downPaymentDollars + price * 0.015 + 20000;
    monthlyDebtService = existingPmt + gapPmt;
  }

  const annualDebtService = monthlyDebtService * 12;

  // 4. Returns & KPIs
  const netCashFlowAnnual = noi - annualDebtService;
  const netCashFlowMonthly = netCashFlowAnnual / 12;

  const cashOnCashReturn =
    totalCashRequired > 0 ? (netCashFlowAnnual / totalCashRequired) * 100 : 0;
  const capRate = price > 0 ? (noi / price) * 100 : 0;

  // DSCR calculation: Monthly Gross Projected STR Revenue / Total Monthly PITI
  const monthlyTaxes = propertyTaxes / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyPiti = monthlyDebtService + monthlyTaxes + monthlyInsurance;
  const monthlyGrossRevenue = totalRevenue / 12;

  const dscrRatio = monthlyPiti > 0 ? monthlyGrossRevenue / monthlyPiti : 99.9;

  let dscrBadge: 'green' | 'amber' | 'red' = 'green';
  if (dscrRatio >= 1.25) {
    dscrBadge = 'green';
  } else if (dscrRatio >= 1.0) {
    dscrBadge = 'amber';
  } else {
    dscrBadge = 'red';
  }

  // 5. Break-Even Occupancy Calculation
  const fixedAnnualCosts = propertyTaxes + insurance + utilities + wifi + hoa + annualDebtService;
  const variableRate =
    (expenses.platformFeeRate || 0.03) +
    (expenses.managementFeeRate || 0.15) +
    (expenses.maintenanceCapExRate || 0.05);
  const netNightlyRate = adr * (1 - variableRate);
  const breakEvenNights = netNightlyRate > 0 ? fixedAnnualCosts / netNightlyRate : 180;
  const breakEvenOccupancy = Math.min(Math.round((breakEvenNights / 365) * 100), 95);

  return {
    grossAnnualRevenue: grossRent,
    cleaningRevenue,
    totalRevenue,
    operatingExpenses,
    noi,
    annualDebtService,
    monthlyDebtService,
    netCashFlowAnnual,
    netCashFlowMonthly,
    cashOnCashReturn,
    capRate,
    dscrRatio,
    dscrBadge,
    breakEvenOccupancy,
    totalCashRequired,
    loanPrincipal,
    downPaymentDollars,
  };
}

/**
 * Returns formatted currency string ($XXX,XXX)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns formatted percentage string (XX.X%)
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
