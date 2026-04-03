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

export function calculateFinancialScore(finance: RawMetrics["financial"]): number {
  // Simple heuristic: 
  // Savings > 6 months of expenses is good. 
  // Positive cashflow is good.
  const monthlyCashflow = finance.income - finance.expenses;
  const cashflowScore = Math.min(Math.max((monthlyCashflow / (finance.income || 1)) * 100, 0), 100);
  
  const monthsOfRunway = finance.expenses > 0 ? (finance.savings + finance.investments) / finance.expenses : 12;
  const runwayScore = Math.min((monthsOfRunway / 6) * 100, 100); // 6 months is 100 score

  return (cashflowScore * 0.4) + (runwayScore * 0.6);
}

export function calculateSkillScore(skills: RawMetrics["skills"]): number {
  if (skills.length === 0) return 0;
  
  // Weighted average of skills based on market demand
  let totalWeightedSkill = 0;
  let totalDemand = 0;

  skills.forEach(skill => {
    totalWeightedSkill += skill.level * skill.marketDemand;
    totalDemand += skill.marketDemand;
  });

  return totalDemand > 0 ? totalWeightedSkill / totalDemand : 0;
}

export function calculateExecutionScore(execution: RawMetrics["execution"]): number {
  return Math.min(Math.max(execution.habitCompletionRate, 0), 100);
}

export function calculateOpportunityScore(opportunity: RawMetrics["opportunity"]): number {
  return (opportunity.networkReach * 0.5) + (opportunity.optionsValue * 0.5);
}

export function calculateRiskBuffer(finance: RawMetrics["financial"]): number {
  // Risk buffer is heavily based on liquid runway (savings vs expenses)
  const monthsOfRunway = finance.expenses > 0 ? finance.savings / finance.expenses : 12;
  return Math.min((monthsOfRunway / 12) * 100, 100); // 12 months for a perfect 100 risk buffer
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
 * Formula: F*0.3 + S*0.25 + E*0.2 + O*0.15 + R*0.1
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
