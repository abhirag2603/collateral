import { 
  calculateFinancialScore, 
  calculateSkillScore, 
  calculateExecutionScore, 
  calculateOpportunityScore, 
  calculateRiskBuffer, 
  calculateCollateralScore 
} from "../src/lib/scoring.ts";

console.log("=== COLLATERAL SCORING VALIDATION TEST ===");

const testCases = [
  {
    name: "Entry Level / Zero Inputs",
    metrics: {
      financial: { income: 0, expenses: 0, savings: 0, investments: 0 },
      skills: [],
      execution: { habitCompletionRate: 0 },
      opportunity: { networkReach: 30, optionsValue: 50 },
    }
  },
  {
    name: "College Grad / Early Career (Living paycheck-to-paycheck)",
    metrics: {
      financial: { income: 3200, expenses: 3100, savings: 1000, investments: 0 },
      skills: [
        { level: 60, marketDemand: 70 },
        { level: 50, marketDemand: 60 }
      ],
      execution: { habitCompletionRate: 40 },
      opportunity: { networkReach: 40, optionsValue: 40 },
    }
  },
  {
    name: "Solid Mid-Level Professional (50% savings, 10mo buffer, 3 high skills)",
    metrics: {
      financial: { income: 8000, expenses: 4000, savings: 25000, investments: 15000 },
      skills: [
        { level: 80, marketDemand: 85 },
        { level: 75, marketDemand: 80 },
        { level: 70, marketDemand: 75 }
      ],
      execution: { habitCompletionRate: 80 },
      opportunity: { networkReach: 65, optionsValue: 70 },
    }
  },
  {
    name: "Elite Antifragile Operator (High income, large runway, 5 diverse skills)",
    metrics: {
      financial: { income: 20000, expenses: 6000, savings: 60000, investments: 150000 },
      skills: [
        { level: 95, marketDemand: 95 },
        { level: 90, marketDemand: 90 },
        { level: 85, marketDemand: 85 },
        { level: 80, marketDemand: 80 },
        { level: 75, marketDemand: 75 }
      ],
      execution: { habitCompletionRate: 95 },
      opportunity: { networkReach: 85, optionsValue: 90 },
    }
  },
  {
    name: "High Income but High Burn (Negative cashflow, 1 month buffer)",
    metrics: {
      financial: { income: 15000, expenses: 18000, savings: 10000, investments: 5000 },
      skills: [
        { level: 85, marketDemand: 90 }
      ],
      execution: { habitCompletionRate: 30 },
      opportunity: { networkReach: 50, optionsValue: 40 },
    }
  }
];

testCases.forEach((tc) => {
  const result = calculateCollateralScore(tc.metrics);
  console.log(`\nScenario: ${tc.name}`);
  console.log(`- Financial (30%):   ${result.financial}`);
  console.log(`- Skill (25%):       ${result.skill}`);
  console.log(`- Execution (20%):   ${result.execution}`);
  console.log(`- Opportunity (15%): ${result.opportunity}`);
  console.log(`- Risk Buffer (10%): ${result.risk}`);
  console.log(`=> TOTAL COLLATERAL: ${result.total}/100`);
});
