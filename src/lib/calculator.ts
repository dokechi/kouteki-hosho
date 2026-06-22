import benefits from "@/data/benefits.json";
import type { Benefit, BenefitResult, UserInput } from "./types";

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const standardMonthlyRemunerations = [
  58000, 68000, 78000, 88000, 98000, 110000, 126000, 142000, 160000,
  180000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000,
  360000, 380000, 410000, 440000, 470000, 500000, 530000, 560000, 590000,
  620000, 650000,
];

function closestStandardMonthlyRemuneration(monthlySalary: number) {
  return standardMonthlyRemunerations.reduce((closest, current) =>
    Math.abs(current - monthlySalary) < Math.abs(closest - monthlySalary)
      ? current
      : closest,
  );
}

function highCostMedicalLimit(annualIncome: number) {
  if (annualIncome >= 11600000) return "約252,600円＋医療費に応じた加算";
  if (annualIncome >= 7700000) return "約167,400円＋医療費に応じた加算";
  if (annualIncome >= 3700000) return "約80,100円＋医療費に応じた加算";
  return "約57,600円/月";
}

function estimateAmount(id: string, input: UserInput) {
  const standard = closestStandardMonthlyRemuneration(input.monthlySalary);
  const dailyTwoThirds = Math.round((standard / 30) * (2 / 3));
  const monthlySixtySevenPercent = Math.round(input.monthlySalary * 0.67);

  switch (id) {
    case "standard-monthly-remuneration":
      return yen.format(standard);
    case "high-cost-medical-expense":
      return highCostMedicalLimit(input.annualIncome);
    case "sickness-allowance":
    case "maternity-allowance":
      return `${yen.format(dailyTwoThirds)}/日`;
    case "child-allowance":
      return input.children > 0 ? `${yen.format(input.children * 10000)}/月〜` : "子ども情報なし";
    case "childbirth-lump-sum":
      return yen.format(500000);
    case "childcare-leave-benefit":
    case "family-care-leave-benefit":
      return `${yen.format(monthlySixtySevenPercent)}/月`;
    case "burial-fee":
      return yen.format(50000);
    case "survivor-disability-pension":
      return "概算・要確認";
    default:
      return "要確認";
  }
}

function noteFor(input: UserInput) {
  return `${input.prefecture}・${input.age}歳・${input.household}の入力条件でブラウザ内計算しました。MVP検証用の仮データ・簡易ロジックであり、正式な制度計算ではありません。入力データは保存されません。`;
}

export function calculateBenefits(input: UserInput): BenefitResult[] {
  return (benefits as Benefit[]).map((benefit) => ({
    ...benefit,
    estimatedAmount: estimateAmount(benefit.id, input),
    note: noteFor(input),
  }));
}

export const sourceBenefits = benefits as Benefit[];
