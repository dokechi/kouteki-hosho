export type InsuranceStatus = "employee" | "dependent" | "national" | "unknown";

export type UserInput = {
  age: number;
  insuranceStatus: InsuranceStatus;
  annualIncome: number;
  hasSpouse: boolean;
  hasChildren: boolean;
  childrenCount: number;
  childAges: number[];
};

export type BenefitCardData = {
  id: string;
  scene: string;
  name: string;
  summary: string;
  baseAmountLabel: string;
  eligibilityHint: string;
};

export type SourceLink = {
  name: string;
  url: string;
};

export type BenefitSource = {
  id: string;
  sourceName: string;
  sourceUrl: string;
  sourceLinks?: SourceLink[];
  checkedAt: string;
  caution: string;
};

export type Benefit = BenefitCardData & BenefitSource;

export type AccuracyLabel = "高精度" | "中精度" | "要確認";

export type BenefitResult = Benefit & {
  estimatedAmount: string;
  listAmount: string;
  accuracy: AccuracyLabel;
  amountBreakdown?: string[];
  eligibilityPossibility: string;
  reason: string;
  variables: string[];
  nextChecks: string[];
  note: string;
  supplementalNotice?: string;
};
