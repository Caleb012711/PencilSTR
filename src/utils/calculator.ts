import { FinancingType, PropertyDeal, UnderwritingMetrics } from '../types';

export function calculateMonthlyMortgage(principal: number, annualInterestRatePct: number, years: number): number {
  if (principal <= 0) return 0;
  if (annualInterestRatePct <= 0) return principal / (years * 12);
  const monthlyRate = (annualInterestRatePct / 100) / 12;
  const numberOfPayments = Math.max(1, years * 12);
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}

export function computeUnderwriting(
  deal: PropertyDeal | any,
  adr?: number,
  occupancyPct?: number,
  financingType?: FinancingType,
  overrideDownPaymentPct?: number,
  overrideInterestRate?: number
): UnderwritingMetrics {
  // Safe defaults if deal is undefined
  if (!deal) {
    return {
      grossAnnualRevenue: 0,
      cleaningRevenue: 0,
      totalRevenue: 0,
      operatingExpenses: 0,
      noi: 0,
      annualDebtService: 0,
      monthlyDebtService: 0,
      netCashFlowAnnual: 0,
      netCashFlowMonthly: 0,
      cashOnCashReturn: 0,
      capRate: 0,
      dscrRatio: 1.25,
      totalCashRequired: 0,
      totalMonthlyRevenue: 0,
    };
  }

  const basePrice = Number(deal.price) || 600000;
  const targetAdr = Number(adr !== undefined ? adr : (deal.baseAdr || 450));
  const targetOcc = Number(occupancyPct !== undefined ? occupancyPct : (deal.baseOccupancy || 65));
  const strat: FinancingType = financingType || (deal.financing?.strategy as FinancingType) || 'dscr';

  const occRate = Math.min(Math.max(targetOcc / 100, 0.05), 0.98);
  const nightsBooked = Math.round(365 * occRate);
  const avgStayNights = 3.2;
  const turnsCount = Math.round(nightsBooked / avgStayNights);

  // Revenue
  const grossRent = nightsBooked * targetAdr;
  const cleaningFeeRate = Number(deal.expenses?.cleaningFeePerStay) || 175;
  const cleaningRevenue = turnsCount * cleaningFeeRate;
  const totalRevenue = grossRent + cleaningRevenue;

  // Expenses
  const platformFee = grossRent * (Number(deal.expenses?.platformFeeRate) || 0.03);
  const managementFee = grossRent * (Number(deal.expenses?.managementFeeRate) || 0.15);
  const cleaningCost = turnsCount * cleaningFeeRate; // cleaning is pass-through
  const propertyTaxes = Number(deal.expenses?.propertyTaxesAnnual || deal.expenses?.taxesAnnual) || 5000;
  const insurance = Number(deal.expenses?.insuranceAnnual) || 2800;
  const utilities = (Number(deal.expenses?.utilitiesMonthly) || 400) * 12;
  const hoaFee = Number(deal.expenses?.hoaFeeAnnual || (deal.expenses?.hoaFeeMonthly ? deal.expenses.hoaFeeMonthly * 12 : 0)) || 0;
  const maintenanceCapEx = grossRent * (Number(deal.expenses?.maintenanceCapExRate) || 0.05);

  const operatingExpenses = platformFee + managementFee + cleaningCost + propertyTaxes + insurance + utilities + hoaFee + maintenanceCapEx;
  const noi = totalRevenue - operatingExpenses;

  // Financing calculation - adapt to either deal.financingPreset or deal.financing
  let defaultDownPct = 20;
  let defaultRate = 7.15;
  let defaultPoints = 1.25;
  let loanTerm = 30;

  if (deal.financingPreset && deal.financingPreset[strat]) {
    defaultDownPct = deal.financingPreset[strat].downPaymentPercent;
    defaultRate = deal.financingPreset[strat].interestRate;
    defaultPoints = deal.financingPreset[strat].points || 1.25;
    loanTerm = deal.financingPreset[strat].amortizationYears || 30;
  } else if (deal.financing) {
    defaultDownPct = deal.financing.downPaymentPct || 20;
    defaultRate = deal.financing.interestRate || 7.25;
    defaultPoints = deal.financing.points || 1.25;
    loanTerm = deal.financing.amortizationYears || 30;
  }

  const downPaymentPct = overrideDownPaymentPct !== undefined ? overrideDownPaymentPct : defaultDownPct;
  const interestRate = overrideInterestRate !== undefined ? overrideInterestRate : defaultRate;

  const downPayment = basePrice * (downPaymentPct / 100);
  const loanPrincipal = Math.max(0, basePrice - downPayment);
  const loanPointsCost = loanPrincipal * (defaultPoints / 100);
  const estimatedClosingCosts = basePrice * 0.02 + loanPointsCost;
  const reserves = Number(deal.capitalStack?.reserves) || 30000;
  const totalCashRequired = downPayment + estimatedClosingCosts + reserves;

  const monthlyDebtService = calculateMonthlyMortgage(loanPrincipal, interestRate, loanTerm);
  const annualDebtService = monthlyDebtService * 12;

  const netCashFlowAnnual = noi - annualDebtService;
  const netCashFlowMonthly = netCashFlowAnnual / 12;

  const cashOnCashReturn = totalCashRequired > 0 ? (netCashFlowAnnual / totalCashRequired) * 100 : 0;
  const capRate = basePrice > 0 ? (noi / basePrice) * 100 : 0;
  const dscrRatio = annualDebtService > 0 ? (noi / annualDebtService) : 99.9;

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
    totalCashRequired,
    totalMonthlyRevenue: totalRevenue / 12,
  };
}

export function formatCurrency(amount: number, decimals: number = 0): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
}
