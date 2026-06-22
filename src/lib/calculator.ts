import benefitCards from "@/data/benefitCards.json";
import childAllowance from "@/data/childAllowance.json";
import employmentBenefits from "@/data/employmentBenefits.json";
import healthBenefits from "@/data/healthBenefits.json";
import highCostMedical from "@/data/highCostMedical.json";
import pensionBenefits from "@/data/pensionBenefits.json";
import sources from "@/data/sources.json";
import standardRemuneration from "@/data/standardRemuneration.json";
import type {
  Benefit,
  BenefitCardData,
  BenefitResult,
  BenefitSource,
  UserInput,
} from "./types";

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const standardMonthlyRemunerations = standardRemuneration.monthlyAmounts;
const sourceByBenefitId = new Map(
  (sources as BenefitSource[]).map((source) => [source.id, source]),
);

function closestStandardMonthlyRemuneration(monthlySalary: number) {
  return standardMonthlyRemunerations.reduce((closest, current) =>
    Math.abs(current - monthlySalary) < Math.abs(closest - monthlySalary)
      ? current
      : closest,
  );
}

function highCostMedicalLimit(annualIncome: number) {
  const bracket = highCostMedical.incomeBrackets.find(
    ({ minimumAnnualIncome }) => annualIncome >= minimumAnnualIncome,
  );

  return bracket?.limitLabel ?? "要確認";
}

function dailyTwoThirdsAmount(
  standard: number,
  config: {
    dailyRateNumerator: number;
    dailyRateDenominator: number;
    standardMonthlyDivisor: number;
  },
) {
  return Math.round(
    (standard / config.standardMonthlyDivisor) *
      (config.dailyRateNumerator / config.dailyRateDenominator),
  );
}

function monthlyEmploymentBenefit(
  monthlySalary: number,
  config: { monthlySalaryRate: number },
) {
  return Math.round(monthlySalary * config.monthlySalaryRate);
}

function estimateAmount(id: string, input: UserInput) {
  const standard = closestStandardMonthlyRemuneration(input.monthlySalary);

  switch (id) {
    case "standard-monthly-remuneration":
      return yen.format(standard);
    case "high-cost-medical-expense":
      return highCostMedicalLimit(input.annualIncome);
    case "sickness-allowance":
      return `${yen.format(
        dailyTwoThirdsAmount(standard, healthBenefits.sicknessAllowance),
      )}/日`;
    case "maternity-allowance":
      return `${yen.format(
        dailyTwoThirdsAmount(standard, healthBenefits.maternityAllowance),
      )}/日`;
    case "child-allowance":
      return input.children > 0
        ? `${yen.format(input.children * childAllowance.monthlyAmountPerChild)}${childAllowance.suffix}`
        : childAllowance.noChildrenLabel;
    case "childbirth-lump-sum":
      return yen.format(healthBenefits.childbirthLumpSum.amount);
    case "childcare-leave-benefit":
      return `${yen.format(
        monthlyEmploymentBenefit(
          input.monthlySalary,
          employmentBenefits.childcareLeaveBenefit,
        ),
      )}/月`;
    case "family-care-leave-benefit":
      return `${yen.format(
        monthlyEmploymentBenefit(
          input.monthlySalary,
          employmentBenefits.familyCareLeaveBenefit,
        ),
      )}/月`;
    case "burial-fee":
      return yen.format(healthBenefits.burialFee.amount);
    case "survivor-disability-pension":
      return pensionBenefits.survivorDisabilityPension.estimateLabel;
    default:
      return "要確認";
  }
}

function noteFor(input: UserInput) {
  return `${input.prefecture}・${input.age}歳・${input.household}の入力条件でブラウザ内計算しました。MVP検証用の仮データ・簡易ロジックであり、正式な制度計算ではありません。入力データは保存されません。`;
}

function withSource(benefit: BenefitCardData): Benefit {
  const source = sourceByBenefitId.get(benefit.id);

  if (!source) {
    throw new Error(`Missing source data for benefit: ${benefit.id}`);
  }

  return { ...benefit, ...source };
}

export function calculateBenefits(input: UserInput): BenefitResult[] {
  return (benefitCards as BenefitCardData[]).map((benefit) => ({
    ...withSource(benefit),
    estimatedAmount: estimateAmount(benefit.id, input),
    note: noteFor(input),
  }));
}

export const sourceBenefits = (benefitCards as BenefitCardData[]).map(withSource);
