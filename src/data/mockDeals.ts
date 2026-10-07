import { CcrClauseAudit, PropertyDeal } from '../types';

export const MOCK_DEALS: PropertyDeal[] = [
  {
    id: 'timberline-ridge',
    mlsNumber: '248190',
    title: 'Timberline Ridge Lodge',
    location: 'Gatlinburg, TN',
    marketName: 'Smoky Mountains Cohort',
    elevation: '2,420 FT',
    price: 625000,
    originalPrice: 650000,
    priceDrop: 25000,
    beds: 4,
    baths: 3.5,
    sqft: 2840,
    imageUrl: 'https://images.unsplash.com/photo-1741948924635-13a7ddbc6a05?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Modern architectural dark timber cabin nestled in the Smoky Mountain pines at dusk with floor-to-ceiling glass walls.',
    imageGallery: [
      'https://images.unsplash.com/photo-1741948924635-13a7ddbc6a05?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1697299261617-91f3902bfeea?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1708630283392-678476d547f8?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1617912477078-9aa3ce1d8970?auto=format&fit=crop&w=1400&q=80',
    ],
    aspectRatio: 'landscape',
    compScore: 96,
    distanceMiles: 0.8,
    viewType: 'Smoky Mountain Ridgeline & Pine Canopy',
    permitDetails: {
      number: 'STR-2024-0418-SEV',
      jurisdiction: 'Sevier County, TN',
      badgeText: 'UNRESTRICTED',
    },
    turnkey: true,
    baseAdr: 485,
    minCompAdr: 320,
    peakHighAdr: 550,
    baseOccupancy: 64,
    breakEvenOccupancy: 50,
    topMarketOccupancy: 78,
    seasonality: [
      { month: 'J', name: 'January', revenue: 5800, occupancy: 42, adr: 440 },
      { month: 'F', name: 'February', revenue: 5200, occupancy: 40, adr: 445 },
      { month: 'M', name: 'March', revenue: 7600, occupancy: 58, adr: 460 },
      { month: 'A', name: 'April', revenue: 8400, occupancy: 62, adr: 470 },
      { month: 'M', name: 'May', revenue: 9900, occupancy: 66, adr: 480 },
      { month: 'J', name: 'June', revenue: 12400, occupancy: 82, adr: 510 },
      { month: 'J', name: 'July', revenue: 13200, occupancy: 86, adr: 520 },
      { month: 'A', name: 'August', revenue: 11500, occupancy: 76, adr: 495 },
      { month: 'S', name: 'September', revenue: 9100, occupancy: 64, adr: 475 },
      { month: 'O', name: 'October', revenue: 14200, occupancy: 91, adr: 550, isPeak: true },
      { month: 'N', name: 'November', revenue: 10400, occupancy: 70, adr: 490 },
      { month: 'D', name: 'December', revenue: 12100, occupancy: 80, adr: 525 }
    ],
    hoaStatus: {
      statusText: 'HOA CC&Rs: UNRESTRICTED STR',
      section: '§4.1',
      isUnrestricted: true,
      warningNote: 'Max 4 Vehicles'
    },
    capitalStack: {
      loanPrincipal: 500000,
      downPayment: 125000,
      reserves: 35000,
      loanPercentage: 76,
      downPercentage: 19,
      reservesPercentage: 5
    },
    expenses: {
      propertyTaxesAnnual: 4850,
      insuranceAnnual: 2750,
      utilitiesMonthly: 390,
      managementFeeRate: 0.15,
      platformFeeRate: 0.03,
      maintenanceCapExRate: 0.05,
      hoaFeeAnnual: 1200,
      cleaningFeePerStay: 185
    },
    financingPreset: {
      dscr: {
        interestRate: 7.15,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.5
      },
      conventional: {
        interestRate: 6.85,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.0
      },
      seller_carry: {
        interestRate: 5.50,
        downPaymentPercent: 15,
        amortizationYears: 30,
        balloonYears: 5,
        points: 0
      }
    }
  },
  {
    id: 'kierland-hideaway',
    mlsNumber: '418902',
    title: 'Kierland Hideaway',
    location: 'Scottsdale, AZ',
    marketName: 'Sonoran Luxury Desert Cohort',
    elevation: '1,280 FT',
    price: 890000,
    originalPrice: 915000,
    priceDrop: 25000,
    beds: 5,
    baths: 4.5,
    sqft: 3420,
    imageUrl: 'https://images.unsplash.com/photo-1570630856429-32cf3feef67c?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'A luxury modern desert villa in Scottsdale Arizona with illuminated swimming pool, desert landscaping with saguaro cacti, limestone walls, warm evening lights glowing.',
    imageGallery: [
      'https://images.unsplash.com/photo-1570630856429-32cf3feef67c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1681407980201-9c1e64d5f502?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1526111787490-c108ba3880b3?auto=format&fit=crop&w=1400&q=80',
    ],
    aspectRatio: 'portrait',
    compScore: 94,
    distanceMiles: 1.4,
    viewType: 'Camelback Mountain & Sonoran Desert',
    permitDetails: {
      number: 'SCOT-LIC-2049103',
      jurisdiction: 'City of Scottsdale, AZ',
      badgeText: 'CONDITIONAL',
    },
    turnkey: true,
    baseAdr: 590,
    minCompAdr: 380,
    peakHighAdr: 780,
    baseOccupancy: 66,
    breakEvenOccupancy: 48,
    topMarketOccupancy: 81,
    seasonality: [
      { month: 'J', name: 'January', revenue: 14800, occupancy: 82, adr: 610 },
      { month: 'F', name: 'February', revenue: 19500, occupancy: 94, adr: 780, isPeak: true }, // WM Open / Superbowl
      { month: 'M', name: 'March', revenue: 18200, occupancy: 90, adr: 720 }, // Spring Training
      { month: 'A', name: 'April', revenue: 14100, occupancy: 78, adr: 610 },
      { month: 'M', name: 'May', revenue: 9800, occupancy: 58, adr: 510 },
      { month: 'J', name: 'June', revenue: 6200, occupancy: 42, adr: 440 },
      { month: 'J', name: 'July', revenue: 5400, occupancy: 38, adr: 420 },
      { month: 'A', name: 'August', revenue: 5900, occupancy: 40, adr: 430 },
      { month: 'S', name: 'September', revenue: 8700, occupancy: 54, adr: 490 },
      { month: 'O', name: 'October', revenue: 13500, occupancy: 74, adr: 590 },
      { month: 'N', name: 'November', revenue: 15200, occupancy: 80, adr: 630 },
      { month: 'D', name: 'December', revenue: 16100, occupancy: 82, adr: 650 }
    ],
    hoaStatus: {
      statusText: 'CITY PERMIT CURRENT (2026)',
      section: 'Scottsdale Ord. 4655',
      isUnrestricted: true,
      warningNote: 'Noise Monitor Required'
    },
    capitalStack: {
      loanPrincipal: 712000,
      downPayment: 178000,
      reserves: 45000,
      loanPercentage: 76,
      downPercentage: 19,
      reservesPercentage: 5
    },
    expenses: {
      propertyTaxesAnnual: 6800,
      insuranceAnnual: 3400,
      utilitiesMonthly: 520, // pool heating + AC
      managementFeeRate: 0.15,
      platformFeeRate: 0.03,
      maintenanceCapExRate: 0.05,
      hoaFeeAnnual: 850,
      cleaningFeePerStay: 240
    },
    financingPreset: {
      dscr: {
        interestRate: 7.25,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.25
      },
      conventional: {
        interestRate: 6.95,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.0
      },
      seller_carry: {
        interestRate: 5.75,
        downPaymentPercent: 15,
        amortizationYears: 30,
        balloonYears: 5,
        points: 0
      }
    }
  },
  {
    id: 'blue-ridge-alpine',
    mlsNumber: '552019',
    title: 'Blue Ridge View Retreat',
    location: 'Blue Ridge, GA',
    marketName: 'North Georgia Highlands',
    elevation: '1,890 FT',
    price: 550000,
    originalPrice: 568000,
    priceDrop: 18000,
    beds: 3,
    baths: 3.0,
    sqft: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1703782997454-8eb0d4d94e9c?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Sleek dark timber chalet overlooking mountain ridges with private deck and hot tub.',
    imageGallery: [
      'https://images.unsplash.com/photo-1703782997454-8eb0d4d94e9c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1771824980188-abd59db07585?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1772040942277-b194d9d0b648?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1612211894457-06f6f6cf8635?auto=format&fit=crop&w=1400&q=80',
    ],
    aspectRatio: 'portrait',
    compScore: 91,
    distanceMiles: 2.1,
    viewType: 'Blue Ridge Valley & Alpine Forest',
    permitDetails: {
      number: 'FAN-2024-0922',
      jurisdiction: 'Fannin County, GA',
      badgeText: 'UNRESTRICTED',
    },
    turnkey: true,
    baseAdr: 420,
    minCompAdr: 290,
    peakHighAdr: 510,
    baseOccupancy: 68,
    breakEvenOccupancy: 46,
    topMarketOccupancy: 80,
    seasonality: [
      { month: 'J', name: 'January', revenue: 5400, occupancy: 46, adr: 390 },
      { month: 'F', name: 'February', revenue: 5600, occupancy: 48, adr: 400 },
      { month: 'M', name: 'March', revenue: 7800, occupancy: 62, adr: 410 },
      { month: 'A', name: 'April', revenue: 8900, occupancy: 68, adr: 420 },
      { month: 'M', name: 'May', revenue: 10100, occupancy: 72, adr: 430 },
      { month: 'J', name: 'June', revenue: 12200, occupancy: 84, adr: 470 },
      { month: 'J', name: 'July', revenue: 12800, occupancy: 88, adr: 480 },
      { month: 'A', name: 'August', revenue: 10600, occupancy: 74, adr: 450 },
      { month: 'S', name: 'September', revenue: 9800, occupancy: 70, adr: 440 },
      { month: 'O', name: 'October', revenue: 13900, occupancy: 92, adr: 510, isPeak: true },
      { month: 'N', name: 'November', revenue: 10200, occupancy: 72, adr: 450 },
      { month: 'D', name: 'December', revenue: 11400, occupancy: 78, adr: 470 }
    ],
    hoaStatus: {
      statusText: 'FANNIN COUNTY STR PERMIT READY',
      section: 'Code §18-2',
      isUnrestricted: true,
      warningNote: 'Exterior Quiet Hours 10PM'
    },
    capitalStack: {
      loanPrincipal: 440000,
      downPayment: 110000,
      reserves: 30000,
      loanPercentage: 76,
      downPercentage: 19,
      reservesPercentage: 5
    },
    expenses: {
      propertyTaxesAnnual: 3600,
      insuranceAnnual: 2200,
      utilitiesMonthly: 340,
      managementFeeRate: 0.15,
      platformFeeRate: 0.03,
      maintenanceCapExRate: 0.05,
      hoaFeeAnnual: 600,
      cleaningFeePerStay: 160
    },
    financingPreset: {
      dscr: {
        interestRate: 7.10,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.5
      },
      conventional: {
        interestRate: 6.80,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.0
      },
      seller_carry: {
        interestRate: 5.25,
        downPaymentPercent: 15,
        amortizationYears: 30,
        balloonYears: 5,
        points: 0
      }
    }
  },
  {
    id: 'broken-bow-timber',
    mlsNumber: '339108',
    title: 'Broken Bow Ridge Pines',
    location: 'Broken Bow, OK',
    marketName: 'Hochatown Luxury Cabins',
    elevation: '940 FT',
    price: 740000,
    originalPrice: 765000,
    priceDrop: 25000,
    beds: 4,
    baths: 4.0,
    sqft: 2650,
    imageUrl: 'https://images.unsplash.com/photo-1570793005386-840846445fed?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Hochatown luxury architectural cabin with double-sided stone fireplace and wraparound deck.',
    imageGallery: [
      'https://images.unsplash.com/photo-1570793005386-840846445fed?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1696860740793-1bb7bf33cdc1?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1780147618668-d04caf9b32c5?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1611768817156-b69fe2c9d1b4?auto=format&fit=crop&w=1400&q=80',
    ],
    aspectRatio: 'landscape',
    compScore: 92,
    distanceMiles: 1.8,
    viewType: 'Hochatown Pine Forest & Mountain Creek',
    permitDetails: {
      number: 'HOCHA-2024-1104',
      jurisdiction: 'Hochatown Municipality, OK',
      badgeText: 'UNRESTRICTED',
    },
    turnkey: true,
    baseAdr: 510,
    minCompAdr: 350,
    peakHighAdr: 620,
    baseOccupancy: 62,
    breakEvenOccupancy: 47,
    topMarketOccupancy: 76,
    seasonality: [
      { month: 'J', name: 'January', revenue: 7100, occupancy: 48, adr: 460 },
      { month: 'F', name: 'February', revenue: 7600, occupancy: 52, adr: 470 },
      { month: 'M', name: 'March', revenue: 11200, occupancy: 74, adr: 510 },
      { month: 'A', name: 'April', revenue: 10400, occupancy: 68, adr: 495 },
      { month: 'M', name: 'May', revenue: 11900, occupancy: 72, adr: 510 },
      { month: 'J', name: 'June', revenue: 13900, occupancy: 84, adr: 540 },
      { month: 'J', name: 'July', revenue: 14500, occupancy: 88, adr: 550, isPeak: true },
      { month: 'A', name: 'August', revenue: 11800, occupancy: 74, adr: 515 },
      { month: 'S', name: 'September', revenue: 9900, occupancy: 64, adr: 490 },
      { month: 'O', name: 'October', revenue: 12800, occupancy: 80, adr: 530 },
      { month: 'N', name: 'November', revenue: 11600, occupancy: 74, adr: 505 },
      { month: 'D', name: 'December', revenue: 12700, occupancy: 78, adr: 525 }
    ],
    hoaStatus: {
      statusText: 'HOCHATOWN INCORPORATED PERMIT',
      section: 'Ord. 2024-03',
      isUnrestricted: true,
      warningNote: 'Septic Capacity 10 Guests Max'
    },
    capitalStack: {
      loanPrincipal: 592000,
      downPayment: 148000,
      reserves: 38000,
      loanPercentage: 76,
      downPercentage: 19,
      reservesPercentage: 5
    },
    expenses: {
      propertyTaxesAnnual: 4200,
      insuranceAnnual: 2900,
      utilitiesMonthly: 410,
      managementFeeRate: 0.15,
      platformFeeRate: 0.03,
      maintenanceCapExRate: 0.05,
      hoaFeeAnnual: 900,
      cleaningFeePerStay: 210
    },
    financingPreset: {
      dscr: {
        interestRate: 7.20,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.5
      },
      conventional: {
        interestRate: 6.90,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.0
      },
      seller_carry: {
        interestRate: 5.60,
        downPaymentPercent: 15,
        amortizationYears: 30,
        balloonYears: 5,
        points: 0
      }
    }
  },
  {
    id: 'gulf-shores-sandcastle',
    mlsNumber: '552099',
    title: 'Gulf Shores Sandcastle Villa',
    location: 'Gulf Shores, AL',
    marketName: 'Gulf Coast Emerald Sands',
    elevation: '18 FT',
    price: 940000,
    originalPrice: 980000,
    priceDrop: 40000,
    beds: 6,
    baths: 5.5,
    sqft: 3950,
    imageUrl: 'https://images.unsplash.com/photo-1785202817537-30bdbdbebc59?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Direct oceanfront beachfront beach house with private boardwalk over sugar sand dunes.',
    imageGallery: [
      'https://images.unsplash.com/photo-1785202817537-30bdbdbebc59?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1774423864869-702b21c2490a?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1638398609922-2e48c282fe03?auto=format&fit=crop&w=1400&q=80',
    ],
    aspectRatio: 'square',
    compScore: 98,
    distanceMiles: 0.2,
    viewType: 'Direct Beachfront Dunes & Emerald Surf',
    permitDetails: {
      number: 'GS-STR-2025-0811',
      jurisdiction: 'City of Gulf Shores, AL',
      badgeText: 'UNRESTRICTED',
    },
    turnkey: true,
    baseAdr: 680,
    minCompAdr: 420,
    peakHighAdr: 980,
    baseOccupancy: 68,
    breakEvenOccupancy: 44,
    topMarketOccupancy: 84,
    seasonality: [
      { month: 'J', name: 'January', revenue: 6200, occupancy: 38, adr: 520 },
      { month: 'F', name: 'February', revenue: 7800, occupancy: 46, adr: 560 },
      { month: 'M', name: 'March', revenue: 15400, occupancy: 78, adr: 680 },
      { month: 'A', name: 'April', revenue: 16800, occupancy: 82, adr: 710 },
      { month: 'M', name: 'May', revenue: 21500, occupancy: 90, adr: 820 },
      { month: 'J', name: 'June', revenue: 26400, occupancy: 96, adr: 960, isPeak: true },
      { month: 'J', name: 'July', revenue: 27200, occupancy: 96, adr: 980, isPeak: true },
      { month: 'A', name: 'August', revenue: 18500, occupancy: 80, adr: 790 },
      { month: 'S', name: 'September', revenue: 14200, occupancy: 72, adr: 650 },
      { month: 'O', name: 'October', revenue: 16100, occupancy: 76, adr: 680 },
      { month: 'N', name: 'November', revenue: 8400, occupancy: 50, adr: 540 },
      { month: 'D', name: 'December', revenue: 9200, occupancy: 54, adr: 560 }
    ],
    hoaStatus: {
      statusText: 'GULF SHORES STR PERMIT CERTIFIED',
      section: 'City Ord. §14-102',
      isUnrestricted: true,
      warningNote: 'Dune Walkway Protection Zone'
    },
    capitalStack: {
      loanPrincipal: 752000,
      downPayment: 188000,
      reserves: 48000,
      loanPercentage: 76,
      downPercentage: 19,
      reservesPercentage: 5
    },
    expenses: {
      propertyTaxesAnnual: 5400,
      insuranceAnnual: 4800,
      utilitiesMonthly: 460,
      managementFeeRate: 0.15,
      platformFeeRate: 0.03,
      maintenanceCapExRate: 0.05,
      hoaFeeAnnual: 1800,
      cleaningFeePerStay: 260
    },
    financingPreset: {
      dscr: {
        interestRate: 7.15,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.5
      },
      conventional: {
        interestRate: 6.85,
        downPaymentPercent: 20,
        amortizationYears: 30,
        points: 1.0
      },
      seller_carry: {
        interestRate: 5.50,
        downPaymentPercent: 15,
        amortizationYears: 30,
        balloonYears: 5,
        points: 0
      }
    }
  }
];

export const MOCK_CLAUSES: Record<string, CcrClauseAudit[]> = {
  'timberline-ridge': [
    {
      clauseId: 'c1',
      title: '0-Night Minimum Stay Requirement',
      sectionCode: '§4.1 Covenants Book 148, p. 320',
      status: 'clear',
      summary: 'Explicit short-term leasing allowance with zero restrictions on duration or turnover intervals.',
      verbatimExcerpt: '"No Lot shall be leased for less than 24 hours. Leases of any duration including nightly, weekly, or seasonal transient rental occupancies are expressly authorized as permitted residential uses of the Property."',
      riskAssessment: 'Sovereign Clear. No stealth 30-day min trap or lease cap.',
      operatorRecommendation: 'Insert explicit reference to §4.1 in lender memorandum to document unencumbered STR status.'
    },
    {
      clauseId: 'c2',
      title: 'County Permitting & Transient Occupancy Tax',
      sectionCode: 'Sevier Co. Res. 2024-88',
      status: 'active',
      summary: 'Property holds verified and active Sevier County short-term rental permit (Valid thru Nov 2026).',
      verbatimExcerpt: '"Permit #STR-2024-0418-SEV issued to Timberline Ridge Lodge. Property complies with life-safety inspection (hardwired smoke detectors, fire extinguishers, emergency egress plan posted)."',
      riskAssessment: 'Fully compliant. Transfer requires standard $150 operator re-registration with county clerk.',
      operatorRecommendation: 'Include transfer fee in closing settlement line items.'
    },
    {
      clauseId: 'c3',
      title: 'Quiet Hours & Decibel Thresholds',
      sectionCode: 'HOA Bylaws Rule 12(b)',
      status: 'noted',
      summary: 'Exterior quiet hours enforced between 10:00 PM and 7:00 AM.',
      verbatimExcerpt: '"Outdoor hot tubs, amplified audio, and outdoor gathering areas must observe quiet hours between 10:00 PM and 7:00 AM local time. Violations subject to progressive fine schedule."',
      riskAssessment: 'Standard mountain resort covenant. Low risk if managed proactively.',
      operatorRecommendation: 'Install Minut or NoiseAware decibel sensor on outdoor deck with automated SMS warnings to guests.'
    },
    {
      clauseId: 'c4',
      title: 'Maximum Vehicle Parking Capacity',
      sectionCode: 'CC&Rs §6.8 (Parking)',
      status: 'warning',
      summary: 'Maximum 4 passenger vehicles permitted on driveway. Strictly no RVs, boat trailers, or street parking.',
      verbatimExcerpt: '"All guest vehicles shall be parked strictly within the demarcated paved driveway apron. Parking along subdivision right-of-way is strictly prohibited and subject to immediate tow at vehicle owner expense. Maximum four (4) vehicles per dwelling unit."',
      riskAssessment: 'Capped at 4 vehicles. Must be clearly conveyed in Airbnb listing rules.',
      operatorRecommendation: 'Include strict parking diagram in guest welcome guide and check-in portal.'
    }
  ],
  'kierland-hideaway': [
    {
      clauseId: 'sc1',
      title: 'Scottsdale City STR License Ordinance',
      sectionCode: 'Scottsdale Rev. Code Ord. 4655',
      status: 'clear',
      summary: 'City of Scottsdale Short-Term Rental License actively registered and validated.',
      verbatimExcerpt: '"License #2049103 active. Background check verification on file. 24/7 Emergency contact registered with Scottsdale Police Dispatch."',
      riskAssessment: 'Active & compliant. Annual renewal requires $250 fee and current neighbor notification dispatch.',
      operatorRecommendation: 'Ensure 24/7 local contact is retained (e.g. professional management dispatch).'
    },
    {
      clauseId: 'sc2',
      title: 'Swimming Pool & Spa Safety Barrier',
      sectionCode: 'A.R.S. §36-1681 & City Code §31-67',
      status: 'clear',
      summary: 'Self-closing, self-latching perimeter gates and pool safety alarm certified.',
      verbatimExcerpt: '"Enclosed pool barrier inspected February 2025. Complies with state child drowning prevention standards."',
      riskAssessment: 'Zero liability notice.',
      operatorRecommendation: 'Maintain monthly safety latch log for insurer audit compliance.'
    },
    {
      clauseId: 'sc3',
      title: 'Sound Decibel Monitoring Requirement',
      sectionCode: 'Ord. 4655 §18-120',
      status: 'noted',
      summary: 'Mandatory operational noise monitoring equipment on all exterior patios.',
      verbatimExcerpt: '"Short-term rental operators must install and continuously maintain working outdoor noise monitoring equipment capable of recording decibel levels above 55 dBA during night hours."',
      riskAssessment: 'High enforcement jurisdiction; $1,000 fine for uncalibrated alerts.',
      operatorRecommendation: 'Integrate NoiseAware device directly with guest messaging API.'
    }
  ]
};

export const MOCK_CCR_AUDITS = MOCK_CLAUSES;

export const LIVE_SWEEP_FEED = [
  {
    id: 's1',
    dealId: 'blue-ridge-alpine',
    title: 'Blue Ridge View Retreat',
    location: 'Blue Ridge, GA',
    timeAgo: '4 min ago',
    coc: '18.2% CoC',
    price: '$550,000',
    type: 'Price Cut -$18,000'
  },
  {
    id: 's2',
    dealId: 'timberline-ridge',
    title: 'Timberline Ridge Lodge',
    location: 'Gatlinburg, TN',
    timeAgo: '12 min ago',
    coc: '19.4% CoC',
    price: '$625,000',
    type: 'Price Cut -$25,000'
  },
  {
    id: 's3',
    dealId: 'broken-bow-timber',
    title: 'Broken Bow Ridge Pines',
    location: 'Broken Bow, OK',
    timeAgo: '28 min ago',
    coc: '16.8% CoC',
    price: '$740,000',
    type: 'Price Cut -$25,000'
  },
  {
    id: 's4',
    dealId: 'kierland-hideaway',
    title: 'Kierland Hideaway',
    location: 'Scottsdale, AZ',
    timeAgo: '45 min ago',
    coc: '17.1% CoC',
    price: '$890,000',
    type: 'New Motivated Seller'
  }
];
