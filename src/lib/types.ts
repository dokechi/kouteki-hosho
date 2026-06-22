export type Household = "single" | "couple" | "withChildren" | "caregiving";

export type UserInput = {
  age: number;
  prefecture: string;
  annualIncome: number;
  monthlySalary: number;
  healthInsurancePremium: number;
  pensionPremium: number;
  household: Household;
  children: number;
};

export type Benefit = {
  id: string;
  scene: string;
  name: string;
  summary: string;
  baseAmountLabel: string;
  eligibilityHint: string;
  sourceName: string;
  sourceUrl: string;
  checkedAt: string;
  caution: string;
};

export type BenefitResult = Benefit & {
  estimatedAmount: string;
  note: string;
};
