import benefitCards from "@/data/benefitCards.json";
import childAllowance from "@/data/childAllowance.json";
import employmentBenefits from "@/data/employmentBenefits.json";
import healthBenefits from "@/data/healthBenefits.json";
import highCostMedical from "@/data/highCostMedical.json";
import pensionBenefits from "@/data/pensionBenefits.json";
import sources from "@/data/sources.json";
import standardRemuneration from "@/data/standardRemuneration.json";
import type { AccuracyLabel, Benefit, BenefitCardData, BenefitResult, BenefitSource, InsuranceStatus, UserInput } from "./types";

const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });
const sourceByBenefitId = new Map((sources as BenefitSource[]).map((source) => [source.id, source]));

type StandardGrade = { healthGrade: number; pensionGrade: number | null; standardMonthly: number; monthlySalaryLower: number | null; monthlySalaryUpper: number | null; };
type Under70 = { category: string; label: string; standardMonthlyMin: number | null; standardMonthlyMax: number | null; formulaText: string; multiMonthLimit: number; };

function estimatedMonthlyIncome(input: UserInput) { return Math.round(input.annualIncome / 12); }

function estimateStandardGrade(monthlyIncome: number) {
  return (standardRemuneration.grades as StandardGrade[]).find(({ monthlySalaryLower, monthlySalaryUpper }) => {
    if (monthlySalaryLower === null) return monthlyIncome < (monthlySalaryUpper ?? Infinity);
    if (monthlySalaryUpper === null) return monthlyIncome >= monthlySalaryLower;
    return monthlyIncome >= monthlySalaryLower && monthlyIncome < monthlySalaryUpper;
  }) ?? (standardRemuneration.grades as StandardGrade[])[0];
}

function highCostMedicalLimit(input: UserInput, standard: number) {
  const bracket = input.insuranceStatus === "employee"
    ? (highCostMedical.under70 as Under70[]).find(({ standardMonthlyMin, standardMonthlyMax }) => {
        if (standardMonthlyMin === null) return false;
        if (standardMonthlyMax === null) return standard >= standardMonthlyMin;
        return standard >= standardMonthlyMin && standard <= standardMonthlyMax;
      })
    : undefined;
  if (bracket) return `区分${bracket.category}：${bracket.formulaText}（多数回該当 ${yen.format(bracket.multiMonthLimit)}）`;
  const incomeBracket = highCostMedical.incomeBrackets.find(({ minimumAnnualIncome }) => input.annualIncome >= minimumAnnualIncome);
  return incomeBracket?.limitLabel ?? "要確認";
}

function dailyTwoThirdsAmount(standard: number, config: { dailyRateNumerator: number; dailyRateDenominator: number; standardMonthlyDivisor: number }) {
  return Math.round((standard / config.standardMonthlyDivisor) * (config.dailyRateNumerator / config.dailyRateDenominator));
}
function monthlyTwoThirdsAmount(standard: number, config: { dailyRateNumerator: number; dailyRateDenominator: number; standardMonthlyDivisor: number }) {
  return Math.round(dailyTwoThirdsAmount(standard, config) * 30);
}
function shortMonthlyAmount(amount: number) {
  return `月 約${Math.round(amount / 10000)}万円`;
}
function monthlyEmploymentBenefit(monthlyIncome: number, config: { monthlySalaryRate: number }) { return Math.round(monthlyIncome * config.monthlySalaryRate); }
function statusLabel(status: InsuranceStatus) { return ({ employee: "勤務先の社会保険", dependent: "家族の扶養", national: "国民健康保険", unknown: "加入状況不明" } satisfies Record<InsuranceStatus, string>)[status]; }

function childAllowanceEstimate(input: UserInput) {
  const eligibleChildren = input.childAges.filter((age) => age <= 18).length;
  return eligibleChildren > 0 ? `${yen.format(eligibleChildren * childAllowance.monthlyAmountPerChild)}${childAllowance.suffix}（高校生年代までの入力人数で概算）` : childAllowance.noChildrenLabel;
}

function amountAndAccuracy(id: string, input: UserInput, standard: number): { estimatedAmount: string; listAmount: string; accuracy: AccuracyLabel } {
  const monthly = estimatedMonthlyIncome(input);
  switch (id) {
    case "standard-monthly-remuneration": return { estimatedAmount: `${yen.format(standard)}（年収÷12=${yen.format(monthly)}から推定）`, listAmount: `${yen.format(standard)}目安`, accuracy: "中精度" };
    case "high-cost-medical-expense": return { estimatedAmount: highCostMedicalLimit(input, standard), listAmount: `月 ${highCostMedicalLimit(input, standard).replace(/^区分[^：]+：/, "")}`, accuracy: input.insuranceStatus === "employee" ? "中精度" : "要確認" };
    case "sickness-allowance": return { estimatedAmount: input.insuranceStatus === "employee" ? `${yen.format(dailyTwoThirdsAmount(standard, healthBenefits.sicknessAllowance))}/日、月換算で約${yen.format(monthlyTwoThirdsAmount(standard, healthBenefits.sicknessAllowance))}（概算）` : "本人が健康保険の被保険者か要確認", listAmount: input.insuranceStatus === "employee" ? shortMonthlyAmount(monthlyTwoThirdsAmount(standard, healthBenefits.sicknessAllowance)) : "要確認", accuracy: input.insuranceStatus === "employee" ? "中精度" : "要確認" };
    case "maternity-allowance": return { estimatedAmount: input.insuranceStatus === "employee" ? `${yen.format(dailyTwoThirdsAmount(standard, healthBenefits.maternityAllowance))}/日、月換算で約${yen.format(monthlyTwoThirdsAmount(standard, healthBenefits.maternityAllowance))}（概算）` : "被扶養者・国保は対象外または要確認", listAmount: input.insuranceStatus === "employee" ? shortMonthlyAmount(monthlyTwoThirdsAmount(standard, healthBenefits.maternityAllowance)) : "要確認", accuracy: input.insuranceStatus === "employee" ? "中精度" : "要確認" };
    case "child-allowance": return { estimatedAmount: childAllowanceEstimate(input), listAmount: input.hasChildren ? `月 約${yen.format(input.childAges.filter((age) => age <= 18).length * childAllowance.monthlyAmountPerChild)}` : "子どもがいる場合", accuracy: "要確認" };
    case "childbirth-lump-sum": return { estimatedAmount: `${yen.format(healthBenefits.childbirthLumpSum.standardAmount)}（区分により${yen.format(healthBenefits.childbirthLumpSum.reducedAmount)}）`, listAmount: `約${yen.format(healthBenefits.childbirthLumpSum.standardAmount)}`, accuracy: "高精度" };
    case "childcare-leave-benefit": return { estimatedAmount: `${yen.format(monthlyEmploymentBenefit(monthly, employmentBenefits.childcareLeaveBenefit))}/月（雇用保険加入なら目安）`, listAmount: shortMonthlyAmount(monthlyEmploymentBenefit(monthly, employmentBenefits.childcareLeaveBenefit)), accuracy: "要確認" };
    case "family-care-leave-benefit": return { estimatedAmount: `${yen.format(monthlyEmploymentBenefit(monthly, employmentBenefits.familyCareLeaveBenefit))}/月（雇用保険加入なら目安）`, listAmount: shortMonthlyAmount(monthlyEmploymentBenefit(monthly, employmentBenefits.familyCareLeaveBenefit)), accuracy: "要確認" };
    case "burial-fee": return { estimatedAmount: `${yen.format(healthBenefits.burialFee.amount)}（国保は自治体の葬祭費を確認）`, listAmount: `約${yen.format(healthBenefits.burialFee.amount)}`, accuracy: input.insuranceStatus === "national" ? "要確認" : "高精度" };
    case "survivor-disability-pension": return { estimatedAmount: pensionBenefits.survivorDisabilityPension.estimateLabel, listAmount: "条件あり", accuracy: "要確認" };
    default: return { estimatedAmount: "要確認", listAmount: "要確認", accuracy: "要確認" };
  }
}

function detailFor(id: string, input: UserInput) {
  const employee = input.insuranceStatus === "employee";
  const dependent = input.insuranceStatus === "dependent";
  const national = input.insuranceStatus === "national";
  const broad = input.insuranceStatus === "unknown";
  const common = `入力された加入状況は「${statusLabel(input.insuranceStatus)}」です。`;
  const map: Record<string, Omit<BenefitResult, keyof Benefit | "estimatedAmount" | "listAmount" | "accuracy" | "note">> = {
    "standard-monthly-remuneration": { eligibilityPossibility: employee ? "勤務先の社会保険なら推定対象" : "会社員向けの参考値", reason: "傷病手当金・出産手当金・高額療養費区分の目安に使います。", variables: ["実際の標準報酬月額", "賞与の扱い", "定時決定・随時改定の時期"], nextChecks: ["給与明細", "勤務先の標準報酬月額通知", "健康保険料の控除額"] },
    "high-cost-medical-expense": { eligibilityPossibility: "健康保険を使う医療費なら対象になる可能性が高い", reason: "医療費が高額になった月の自己負担に上限が設けられるためです。", variables: ["年齢", "標準報酬月額または所得区分", "世帯合算", "多数回該当", "住民税非課税区分"], nextChecks: ["健康保険証", "標準報酬月額", "限度額適用認定証", "加入先の付加給付"] },
    "sickness-allowance": { eligibilityPossibility: employee ? "対象になる可能性が高い" : dependent || national ? "協会けんぽ等の被保険者本人でなければ対象外の可能性が高い" : "加入状況により対象外の場合があります", reason: "業務外の病気・けがで働けず給与が十分に出ないときの所得補償です。", variables: ["直近12か月の標準報酬月額", "待期3日", "給与支払い状況", "加入期間"], nextChecks: ["給与明細", "標準報酬月額", "勤務先の休職時給与", "健康保険組合への確認"] },
    "maternity-allowance": { eligibilityPossibility: employee ? "対象になる可能性が高い" : "本人が健康保険の被保険者でない場合は対象外または要確認", reason: "出産のため休業し給与が十分に出ない期間の所得補償です。", variables: ["直近12か月の標準報酬月額", "産前産後の日数", "給与支払い", "退職時期"], nextChecks: ["給与明細", "標準報酬月額", "出産予定日", "勤務先の産休給与"] },
    "child-allowance": { eligibilityPossibility: input.hasChildren ? "子どもの年齢により対象の可能性" : "子どもがいる場合に対象", reason: "高校生年代までの子を養育する世帯への定期給付です。", variables: ["子どもの年齢", "第何子か", "養育状況", "自治体手続き"], nextChecks: ["子どもの生年月日", "住民票のある自治体", "認定請求の期限"] },
    "childbirth-lump-sum": { eligibilityPossibility: national || employee || dependent || broad ? "出産時に対象となる可能性" : "要確認", reason: "健康保険加入者または被扶養者の出産費用を軽減する定額給付です。", variables: ["産科医療補償制度", "妊娠週数", "多胎", "直接支払制度の利用"], nextChecks: ["健康保険証", "出産予定の医療機関", "直接支払制度の書類"] },
    "childcare-leave-benefit": { eligibilityPossibility: employee ? "雇用保険加入なら対象の可能性" : "勤務先・雇用保険加入状況を要確認", reason: "育児休業中の賃金低下を雇用保険から補う制度です。", variables: ["雇用保険の加入期間", "休業前賃金", "育休取得期間", "賃金支払い"], nextChecks: ["雇用保険被保険者証", "育休開始前6か月の賃金", "勤務先の育休制度"] },
    "family-care-leave-benefit": { eligibilityPossibility: employee ? "雇用保険加入なら対象の可能性" : "勤務先・雇用保険加入状況を要確認", reason: "家族介護で休業する場合の収入減に備える制度です。", variables: ["対象家族", "介護状態", "雇用保険の加入期間", "休業日数"], nextChecks: ["雇用保険被保険者証", "介護対象者の状態", "勤務先の介護休業制度"] },
    "burial-fee": { eligibilityPossibility: national ? "自治体の葬祭費を確認" : "埋葬関連給付の対象となる可能性", reason: "健康保険加入者・被扶養者の死亡時に埋葬費用を補う制度です。", variables: ["亡くなった人の加入先", "生計維持関係", "実際の埋葬費", "自治体制度"], nextChecks: ["健康保険証", "加入先保険者", "自治体の葬祭費案内", "埋葬費の領収書"] },
    "survivor-disability-pension": { eligibilityPossibility: "加入歴・家族構成・障害等級により要確認", reason: "死亡・障害時に本人や家族の生活を支える年金制度です。", variables: ["年金加入期間", "保険料納付要件", "配偶者・子どもの有無と年齢", "障害等級"], nextChecks: ["ねんきん定期便", "配偶者・子どもの情報", "初診日", "年金事務所"] },
  };
  const detail = map[id];
  return { ...detail, reason: `${common}${detail.reason}` };
}

function noteFor(input: UserInput, standard: number) { return `${input.age}歳、${statusLabel(input.insuranceStatus)}、年収/所得${yen.format(input.annualIncome)}、推定標準報酬月額${yen.format(standard)}でブラウザ内概算しました。実際は加入先・勤務先・制度改正で変わります。`; }
function withSource(benefit: BenefitCardData): Benefit { const source = sourceByBenefitId.get(benefit.id); if (!source) throw new Error(`Missing source data for benefit: ${benefit.id}`); return { ...benefit, ...source }; }
export function calculateBenefits(input: UserInput): BenefitResult[] { const standard = estimateStandardGrade(estimatedMonthlyIncome(input)).standardMonthly; return (benefitCards as BenefitCardData[]).map((benefit) => ({ ...withSource(benefit), ...amountAndAccuracy(benefit.id, input, standard), ...detailFor(benefit.id, input), note: noteFor(input, standard) })); }
export const sourceBenefits = (benefitCards as BenefitCardData[]).map(withSource);
