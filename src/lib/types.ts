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

export type BenefitCardData = {
  id: string;
  scene: string;
  name: string;
  summary: string;
  baseAmountLabel: string;
  eligibilityHint: string;
};

export type BenefitSource = {
  id: string;
  sourceName: string;
  sourceUrl: string;
  checkedAt: string;
  caution: string;
};

export type Benefit = BenefitCardData & BenefitSource;

export type BenefitResult = Benefit & {
  estimatedAmount: string;
  note: string;
};
