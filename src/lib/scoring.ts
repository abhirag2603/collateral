export interface RawMetrics {
  financial: {
    income: number;
    expenses: number;
    savings: number;
    investments: number;
  };
  skills: { level: number; marketDemand: number }[];
  execution: { habitCompletionRate: number }; // 0 to 100
  opportunity: { networkReach: number; optionsValue: number }; // Both 0 to 100
}

/**
 * Calculates a realistic Financial Collateral Score (0-100)
 * Evaluates:
 * 1. Savings Rate / Monthly Cashflow (40%) - reward living below means
 * 2. Liquid + Invested Runway (45%) - non-linear curve for financial endurance
 * 3. Investment Cushion / Capitalization (15%) - wealth compounding & buffer
 */
export function calculateFinancialScore(finance: RawMetrics["financial"]): number {
  const income = Math.max(0, Number(finance?.income) || 0);
  const expenses = Math.max(0, Number(finance?.expenses) || 0);
  const savings = Math.max(0, Number(finance?.savings) || 0);
  const investments = Math.max(0, Number(finance?.investments) || 0);

  // 1. Cashflow & Savings Rate Score (0 - 100)
  const netCashflow = income - expenses;
  let cashflowScore = 15; // default minimal baseline

  if (income > 0) {
    const savingsRate = netCashflow / income;
    if (savingsRate >= 0) {
      // 0% savings rate gives ~30, 20% gives ~56, 40% gives ~74, 60%+ gives 90-100
      cashflowScore = Math.min(100, Math.max(15, Math.round(30 + Math.pow(savingsRate, 0.7) * 70)));
    } else {
      // Burning cash: heavily penalize relative to burn rate
      cashflowScore = Math.max(0, Math.round(30 + (savingsRate * 50)));
    }
  } else if (expenses === 0 && (savings > 0 || investments > 0)) {
    cashflowScore = 40; // No active burn and possesses capital
  } else if (expenses > 0) {
    cashflowScore = 0; // Burning cash with zero income
  }

  // 2. Liquid + Invested Runway Score (0 - 100)
  // Baseline floor expense prevents infinite/distorted runway when expenses are 0
  const effectiveExpense = Math.max(expenses, 500);
  const totalLiquidBuffer = savings + investments;
  const runwayMonths = totalLiquidBuffer / effectiveExpense;

  // Non-linear exponential asymptote curve:
  // ~1 month = 17, ~3 months = 42, ~6 months = 66, ~12 months = 89, 24+ months = ~99
  const runwayScore = Math.min(100, Math.max(0, Math.round(100 * (1 - Math.exp(-runwayMonths / 5.5)))));

  // 3. Investment Cushion Score (0 - 100)
  // Measures whether the user has productive assets beyond cash
  const assetRatio = investments / (effectiveExpense * 12);
  const assetScore = investments > 0
    ? Math.min(100, Math.round(Math.min(assetRatio * 45, 70) + 30))
    : 0;

  const totalFinancial = (cashflowScore * 0.40) + (runwayScore * 0.45) + (assetScore * 0.15);
  return Math.min(100, Math.max(0, Math.round(totalFinancial)));
}

/**
 * Calculates a realistic Skill Collateral Score (0-100)
 * Evaluates:
 * 1. Skill Quality & Market Relevance (60%) - weighted competency & market demand
 * 2. Breadth / Anti-fragility (25%) - multi-disciplinary redundancy prevents single-point failure
 * 3. Mastery Anchor (15%) - highest leverage core competence
 */
export function calculateSkillScore(skills: RawMetrics["skills"]): number {
  if (!skills || skills.length === 0) return 0;

  // 1. Skill Quality & Market Alignment
  let totalEffectiveQuality = 0;
  let topSkillAnchor = 0;

  skills.forEach((skill) => {
    const level = Math.min(100, Math.max(0, Number(skill.level) || 0));
    const demand = Math.min(100, Math.max(0, Number(skill.marketDemand) || 0));

    // Quality combines self-level with market demand factor
    const effectiveValue = level * (0.35 + 0.65 * (demand / 100));
    totalEffectiveQuality += effectiveValue;

    const anchorValue = level * (demand / 100);
    if (anchorValue > topSkillAnchor) {
      topSkillAnchor = anchorValue;
    }
  });

  const qualityScore = totalEffectiveQuality / skills.length;

  // 2. Breadth factor: rewards having 3-5 complementary skills
  const breadthScale = [0, 45, 70, 85, 95, 100];
  const breadthScore = breadthScale[Math.min(skills.length, 5)];

  const totalSkill = (qualityScore * 0.60) + (breadthScore * 0.25) + (topSkillAnchor * 0.15);
  return Math.min(100, Math.max(0, Math.round(totalSkill)));
}

/**
 * Calculates Execution Collateral Score (0-100)
 * Based on verified habit completion rate
 */
export function calculateExecutionScore(execution: RawMetrics["execution"]): number {
  const rate = Number(execution?.habitCompletionRate) || 0;
  return Math.min(100, Math.max(0, Math.round(rate)));
}

/**
 * Calculates Opportunity Collateral Score (0-100)
 * Balances network leverage with goal progression / option value
 */
export function calculateOpportunityScore(opportunity: RawMetrics["opportunity"]): number {
  const network = Math.min(100, Math.max(0, Number(opportunity?.networkReach) || 0));
  const options = Math.min(100, Math.max(0, Number(opportunity?.optionsValue) || 0));
  return Math.min(100, Math.max(0, Math.round((network * 0.5) + (options * 0.5))));
}

/**
 * Calculates Risk Buffer Score (0-100)
 * Pure emergency liquidity (cash savings vs expenses), independent of illiquid investments
 */
export function calculateRiskBuffer(finance: RawMetrics["financial"]): number {
  const savings = Math.max(0, Number(finance?.savings) || 0);
  const expenses = Math.max(0, Number(finance?.expenses) || 0);
  const effectiveExpense = Math.max(expenses, 500);

  const liquidMonths = savings / effectiveExpense;
  // ~1 month = 21, ~3 months = 51, ~6 months = 76, ~12 months = 94, 18+ months = ~99
  const bufferScore = Math.round(100 * (1 - Math.exp(-liquidMonths / 4.2)));
  return Math.min(100, Math.max(0, bufferScore));
}

export interface CollateralScores {
  financial: number;
  skill: number;
  execution: number;
  opportunity: number;
  risk: number;
  total: number;
}

/**
 * Core Deterministic Calculation for the Collateral Score
 * Formula: F*0.30 + S*0.25 + E*0.20 + O*0.15 + R*0.10
 */
export function calculateCollateralScore(metrics: RawMetrics): CollateralScores {
  const financial = calculateFinancialScore(metrics.financial);
  const skill = calculateSkillScore(metrics.skills);
  const execution = calculateExecutionScore(metrics.execution);
  const opportunity = calculateOpportunityScore(metrics.opportunity);
  const risk = calculateRiskBuffer(metrics.financial);

  const total = 
    financial * 0.30 +
    skill * 0.25 +
    execution * 0.20 +
    opportunity * 0.15 +
    risk * 0.10;

  return {
    financial: Math.round(financial),
    skill: Math.round(skill),
    execution: Math.round(execution),
    opportunity: Math.round(opportunity),
    risk: Math.round(risk),
    total: Math.round(total)
  };
}
