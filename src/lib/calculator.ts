import benefitCards from "@/data/benefitCards.json";
import childAllowance from "@/data/childAllowance.json";
import employmentBenefits from "@/data/employmentBenefits.json";
import healthBenefits from "@/data/healthBenefits.json";
import highCostMedical from "@/data/highCostMedical.json";
import pensionBenefits from "@/data/pensionBenefits.json";
import sources from "@/data/sources.json";
import standardRemuneration from "@/data/standardRemuneration.json";
import type {
  AccuracyLabel,
  Benefit,
  BenefitCardData,
  BenefitResult,
  BenefitSource,
  InsuranceStatus,
  UserInput,
} from "./types";

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const sourceByBenefitId = new Map(
  (sources as BenefitSource[]).map((source) => [source.id, source]),
);

type StandardGrade = {
  healthGrade: number;
  pensionGrade: number | null;
  standardMonthly: number;
  monthlySalaryLower: number | null;
  monthlySalaryUpper: number | null;
};
type Under70 = {
  category: string;
  label: string;
  standardMonthlyMin: number | null;
  standardMonthlyMax: number | null;
  formulaText: string;
  multiMonthLimit: number;
};
const PENSION_STANDARD_MONTHLY_MIN = 88000;
const PENSION_STANDARD_MONTHLY_CAP = 650000;
const AGE_70_PLUS_HIGH_COST_NOTICE =
  "70歳以上は所得区分・外来/入院・世帯単位で上限が変わるため、加入先保険者で確認してください。";
type EmploymentBenefitRate = {
  monthlySalaryRate: number;
  monthlyPaymentCap?: number;
  label?: string;
};

function estimatedMonthlyIncome(input: UserInput) {
  return input.monthlySalary ?? Math.round(input.annualIncome / 12);
}

function estimatedMonthlyIncomeBasis(input: UserInput) {
  return input.monthlySalary === undefined
    ? `年収÷12=${yen.format(Math.round(input.annualIncome / 12))}`
    : `入力月給=${yen.format(input.monthlySalary)}`;
}

function estimateStandardGrade(monthlyIncome: number) {
  return (
    (standardRemuneration.grades as StandardGrade[]).find(
      ({ monthlySalaryLower, monthlySalaryUpper }) => {
        if (monthlySalaryLower === null)
          return monthlyIncome < (monthlySalaryUpper ?? Infinity);
        if (monthlySalaryUpper === null)
          return monthlyIncome >= monthlySalaryLower;
        return (
          monthlyIncome >= monthlySalaryLower &&
          monthlyIncome < monthlySalaryUpper
        );
      },
    ) ?? (standardRemuneration.grades as StandardGrade[])[0]
  );
}

function highCostMedicalLimit(input: UserInput, standard: number) {
  if (input.age >= 70) return AGE_70_PLUS_HIGH_COST_NOTICE;

  const bracket =
    input.insuranceStatus === "employee"
      ? (highCostMedical.under70 as Under70[]).find(
          ({ standardMonthlyMin, standardMonthlyMax }) => {
            if (standardMonthlyMin === null) return false;
            if (standardMonthlyMax === null)
              return standard >= standardMonthlyMin;
            return (
              standard >= standardMonthlyMin && standard <= standardMonthlyMax
            );
          },
        )
      : undefined;
  if (bracket)
    return `区分${bracket.category}：${bracket.formulaText}（多数回該当 ${yen.format(bracket.multiMonthLimit)}）`;
  const incomeBracket = highCostMedical.incomeBrackets.find(
    ({ minimumAnnualIncome }) => input.annualIncome >= minimumAnnualIncome,
  );
  return incomeBracket?.limitLabel ?? "要確認";
}

function roundToNearestTen(amount: number) {
  return Math.round(amount / 10) * 10;
}
function dailyTwoThirdsBenefitAmount(
  standard: number,
  config: {
    dailyRateNumerator: number;
    dailyRateDenominator: number;
    standardMonthlyDivisor: number;
  },
) {
  const roundedDailyStandard = roundToNearestTen(
    standard / config.standardMonthlyDivisor,
  );
  return Math.round(
    roundedDailyStandard *
      (config.dailyRateNumerator / config.dailyRateDenominator),
  );
}
function monthlyTwoThirdsBenefitAmount(
  standard: number,
  config: {
    dailyRateNumerator: number;
    dailyRateDenominator: number;
    standardMonthlyDivisor: number;
  },
) {
  return Math.round(dailyTwoThirdsBenefitAmount(standard, config) * 30);
}
function shortMonthlyAmount(amount: number) {
  return `月 約${Math.round(amount / 10000)}万円`;
}
function shortAnnualAmount(amount: number) {
  return `年 約${Math.round(amount / 10000)}万円`;
}
function survivorBasicPensionAmount(input: UserInput) {
  const config = pensionBenefits.survivorDisabilityPension;
  const eligibleChildren = input.childAges.filter((age) => age <= 18).length;
  if (eligibleChildren === 0) return { amount: 0, eligibleChildren };

  const additionCount = input.hasSpouse
    ? eligibleChildren
    : Math.max(eligibleChildren - 1, 0);
  const childOrderOffset = input.hasSpouse ? 0 : 1;
  const childAddition = Array.from({ length: additionCount }, (_, index) => {
    const childOrder = index + childOrderOffset + 1;
    return childOrder <= 2
      ? config.survivorBasicPensionFirstSecondChildAddition
      : config.survivorBasicPensionThirdAndLaterChildAddition;
  }).reduce((total, amount) => total + amount, 0);

  return {
    amount: config.survivorBasicPensionBaseAmount + childAddition,
    eligibleChildren,
  };
}
function pensionStandardMonthly(standard: number) {
  return Math.min(
    Math.max(standard, PENSION_STANDARD_MONTHLY_MIN),
    PENSION_STANDARD_MONTHLY_CAP,
  );
}
function survivorEmployeesPensionAmount(input: UserInput, standard: number) {
  if (input.insuranceStatus !== "employee") return null;
  const config = pensionBenefits.survivorDisabilityPension;
  return Math.round(
    pensionStandardMonthly(standard) *
      config.survivorEmployeesPensionRemunerationCoefficient *
      config.deemedEnrollmentMonths *
      config.survivorEmployeesPensionRate,
  );
}
function survivorPensionEstimate(input: UserInput, standard: number) {
  const basic = survivorBasicPensionAmount(input);
  const employees = survivorEmployeesPensionAmount(input, standard);
  const total = basic.amount + (employees ?? 0);
  const breakdown = [
    basic.amount > 0
      ? `遺族基礎年金：${shortAnnualAmount(basic.amount)}`
      : "遺族基礎年金：対象児童なしのため原則対象外",
    employees !== null
      ? `遺族厚生年金：${shortAnnualAmount(employees)}`
      : "遺族厚生年金：会社の社会保険加入ではないため金額は断定せず、年金加入歴・納付要件の確認が必要です",
  ];
  const supplementalNotice = [
    "これは請求額の確定計算ではなく、現在の入力条件から見た目安です。",
    "子の判定は、生年月日入力がないため18歳以下で簡易判定しています（厳密には18歳到達年度の3月31日まで）。",
    "遺族厚生年金は、過去の標準報酬月額・賞与・加入月数・短期/長期要件で変わります。",
    "300月みなしは、一定要件に該当する場合の扱いです。",
    "18歳年度末を過ぎた子でも、20歳未満で障害等級1級・2級に該当する場合は対象になることがあります。",
    "障害等級は病名ではなく状態で見ます。例：重い視覚・聴覚障害、手足の著しい障害、日常生活が大きく制限される身体・精神の障害など。",
  ].join(" ");

  if (total === 0) {
    return {
      estimatedAmount:
        "金額は要確認（年金加入歴・保険料納付要件、配偶者・子の状況を年金事務所で確認してください）",
      listAmount: "要確認",
      amountBreakdown: breakdown,
      supplementalNotice,
    };
  }

  return {
    estimatedAmount: `${shortAnnualAmount(total)}（月 約${(total / 12 / 10000).toFixed(1)}万円）`,
    listAmount: shortAnnualAmount(total),
    amountBreakdown: breakdown,
    supplementalNotice,
  };
}
function disabilityChildAddition(eligibleChildren: number) {
  const config = pensionBenefits.disabilityPension;
  return Array.from({ length: eligibleChildren }, (_, index) =>
    index < 2
      ? config.disabilityBasicPensionFirstSecondChildAddition
      : config.disabilityBasicPensionThirdAndLaterChildAddition,
  ).reduce((total, amount) => total + amount, 0);
}
function disabilityEmployeesPensionAmounts(standard: number, hasSpouse: boolean) {
  const config = pensionBenefits.disabilityPension;
  const proportional = Math.round(
    pensionStandardMonthly(standard) *
      config.disabilityEmployeesPensionRemunerationCoefficient *
      config.deemedEnrollmentMonths,
  );
  const spouseAddition = hasSpouse ? config.spouseAdditionalPensionAmount : 0;
  return {
    grade1: Math.round(
      proportional * config.disabilityEmployeesPensionGrade1Rate +
        spouseAddition,
    ),
    grade2: Math.round(
      proportional * config.disabilityEmployeesPensionGrade2Rate +
        spouseAddition,
    ),
    grade3: Math.max(
      Math.round(proportional * config.disabilityEmployeesPensionGrade3Rate),
      config.disabilityEmployeesPensionGrade3MinimumAmount,
    ),
  };
}
function disabilityPensionEstimate(input: UserInput, standard: number) {
  const config = pensionBenefits.disabilityPension;
  const eligibleChildren = input.childAges.filter((age) => age <= 18).length;
  const childAddition = disabilityChildAddition(eligibleChildren);
  const basicGrade1 =
    config.disabilityBasicPensionGrade1Amount + childAddition;
  const basicGrade2 =
    config.disabilityBasicPensionGrade2Amount + childAddition;
  const employees =
    input.insuranceStatus === "employee"
      ? disabilityEmployeesPensionAmounts(standard, input.hasSpouse)
      : null;
  const grade1Total = basicGrade1 + (employees?.grade1 ?? 0);
  const grade2Total = basicGrade2 + (employees?.grade2 ?? 0);
  const grade3Total = employees?.grade3 ?? null;
  const amountBreakdown = [
    `障害基礎年金：${shortAnnualAmount(basicGrade2)}`,
    employees
      ? `障害厚生年金：${shortAnnualAmount(employees.grade2)}`
      : "障害厚生年金：会社の社会保険加入ではないため、3級を含む厚生年金部分の金額は断定しません",
  ];
  const grade3Notice =
    grade3Total === null
      ? "3級は障害厚生年金の制度のため、国民年金のみの場合は金額を断定しません。"
      : `3級の場合：${shortAnnualAmount(grade3Total)}（月 約${(grade3Total / 12 / 10000).toFixed(1)}万円）`;
  const supplementalNotice = [
    `1級の場合：${shortAnnualAmount(grade1Total)}（月 約${(grade1Total / 12 / 10000).toFixed(1)}万円）`,
    grade3Notice,
    "これは請求額の確定計算ではなく、障害等級に該当した場合の金額目安です。",
    "実際の対象可否は、初診日、障害認定日、保険料納付要件、診断書、障害等級の認定で変わります。",
    "障害等級は病名ではなく状態で見ます。",
    "1級：日常生活の多くに介助が必要な状態",
    "2級：日常生活が極めて困難で、働いて収入を得ることが難しい状態",
    "3級：厚生年金加入者が対象。労働に大きな制限が残る状態",
    "身体障害者手帳の等級とは別です。",
    "例：重い視覚・聴覚障害、手足の著しい障害、長期安静が必要な病状、精神の障害などで対象になる場合があります。",
    "配偶者加給年金額は、生計維持関係、配偶者年齢、配偶者自身の年金受給状況などで停止される場合があります。",
    "厚生年金部分は、実際には過去の標準報酬月額、賞与、加入月数で変わります。",
    "子の判定は、生年月日入力がないため18歳以下で簡易判定しています（厳密には18歳到達年度の3月31日まで）。",
  ].join(" ");

  return {
    estimatedAmount: `2級の場合：${shortAnnualAmount(grade2Total)}（月 約${(grade2Total / 12 / 10000).toFixed(1)}万円）`,
    listAmount: shortAnnualAmount(grade2Total),
    amountBreakdown,
    supplementalNotice,
  };
}
function monthlyEmploymentBenefit(
  monthlyIncome: number,
  config: EmploymentBenefitRate,
) {
  const amount = Math.round(monthlyIncome * config.monthlySalaryRate);
  return config.monthlyPaymentCap !== undefined
    ? Math.min(amount, config.monthlyPaymentCap)
    : amount;
}
function childcareLeaveBenefitEstimate(monthlyIncome: number) {
  const first180 = employmentBenefits.childcareLeaveBenefit.first180Days;
  const after181 = employmentBenefits.childcareLeaveBenefit.after181Days;
  return `${first180.label}：${yen.format(monthlyEmploymentBenefit(monthlyIncome, first180))}/月、${after181.label}：${yen.format(monthlyEmploymentBenefit(monthlyIncome, after181))}/月（雇用保険加入なら目安）`;
}
function childcareLeaveBenefitListAmount(monthlyIncome: number) {
  const first180 = monthlyEmploymentBenefit(
    monthlyIncome,
    employmentBenefits.childcareLeaveBenefit.first180Days,
  );
  const after181 = monthlyEmploymentBenefit(
    monthlyIncome,
    employmentBenefits.childcareLeaveBenefit.after181Days,
  );
  return `月 約${Math.round(first180 / 10000)}万円→約${Math.round(after181 / 10000)}万円`;
}
function statusLabel(status: InsuranceStatus) {
  return (
    {
      employee: "勤務先の社会保険",
      dependent: "家族の扶養",
      national: "国民健康保険",
      unknown: "加入状況不明",
    } satisfies Record<InsuranceStatus, string>
  )[status];
}

const CHILD_ALLOWANCE_SIBLING_COUNT_AGE_MAX = 22;

function childAllowanceMonthlyAmount(age: number, childOrderIndex: number) {
  if (age > childAllowance.eligibleAgeMax) return 0;
  if (childOrderIndex >= 2) return childAllowance.amounts.thirdChildOrLater;
  if (age < 3) return childAllowance.amounts.under3;
  return childAllowance.amounts.age3ToHighSchool;
}
function childAllowanceTotal(childAges: number[]) {
  return childAges
    .filter((age) => age <= CHILD_ALLOWANCE_SIBLING_COUNT_AGE_MAX)
    .toSorted((a, b) => b - a)
    .reduce(
      (total, age, index) => total + childAllowanceMonthlyAmount(age, index),
      0,
    );
}
function childAllowanceEstimate(input: UserInput) {
  const eligibleChildren = input.childAges.filter(
    (age) => age <= childAllowance.eligibleAgeMax,
  ).length;
  const total = childAllowanceTotal(input.childAges);
  return eligibleChildren > 0
    ? `${yen.format(total)}${childAllowance.suffix}（3歳未満は月${yen.format(childAllowance.amounts.under3)}、3歳以上高校生年代までは月${yen.format(childAllowance.amounts.age3ToHighSchool)}、第3子以降は月${yen.format(childAllowance.amounts.thirdChildOrLater)}で概算。${childAllowance.thirdChildNote}）`
    : childAllowance.noChildrenLabel;
}

function amountAndAccuracy(
  id: string,
  input: UserInput,
  standard: number,
): {
  estimatedAmount: string;
  listAmount: string;
  accuracy: AccuracyLabel;
  amountBreakdown?: string[];
  supplementalNotice?: string;
} {
  const monthly = estimatedMonthlyIncome(input);
  switch (id) {
    case "standard-monthly-remuneration":
      return {
        estimatedAmount: `${yen.format(standard)}（${estimatedMonthlyIncomeBasis(input)}から推定）`,
        listAmount: `${yen.format(standard)}目安`,
        accuracy: "中精度",
      };
    case "high-cost-medical-expense": {
      const limit = highCostMedicalLimit(input, standard);
      return {
        estimatedAmount: limit,
        listAmount:
          input.age >= 70
            ? "加入先保険者で確認"
            : `月 ${limit.replace(/^区分[^：]+：/, "")}`,
        accuracy:
          input.age >= 70
            ? "要確認"
            : input.insuranceStatus === "employee"
              ? "中精度"
              : "要確認",
        supplementalNotice: highCostMedical.revisionNotice,
      };
    }
    case "sickness-allowance":
      return {
        estimatedAmount:
          input.insuranceStatus === "employee"
            ? `${yen.format(dailyTwoThirdsBenefitAmount(standard, healthBenefits.sicknessAllowance))}/日、月換算で約${yen.format(monthlyTwoThirdsBenefitAmount(standard, healthBenefits.sicknessAllowance))}（概算）`
            : "本人が健康保険の被保険者か要確認",
        listAmount:
          input.insuranceStatus === "employee"
            ? shortMonthlyAmount(
                monthlyTwoThirdsBenefitAmount(
                  standard,
                  healthBenefits.sicknessAllowance,
                ),
              )
            : "要確認",
        accuracy: input.insuranceStatus === "employee" ? "中精度" : "要確認",
      };
    case "maternity-allowance":
      return {
        estimatedAmount:
          input.insuranceStatus === "employee"
            ? `${yen.format(dailyTwoThirdsBenefitAmount(standard, healthBenefits.maternityAllowance))}/日、月換算で約${yen.format(monthlyTwoThirdsBenefitAmount(standard, healthBenefits.maternityAllowance))}（概算）`
            : "被扶養者・国保は対象外または要確認",
        listAmount:
          input.insuranceStatus === "employee"
            ? shortMonthlyAmount(
                monthlyTwoThirdsBenefitAmount(
                  standard,
                  healthBenefits.maternityAllowance,
                ),
              )
            : "要確認",
        accuracy: input.insuranceStatus === "employee" ? "中精度" : "要確認",
      };
    case "child-allowance":
      return {
        estimatedAmount: childAllowanceEstimate(input),
        listAmount: input.hasChildren
          ? `月 約${yen.format(childAllowanceTotal(input.childAges))}`
          : "子どもがいる場合",
        accuracy: "要確認",
      };
    case "childbirth-lump-sum":
      return {
        estimatedAmount: `${yen.format(healthBenefits.childbirthLumpSum.standardAmount)}（区分により${yen.format(healthBenefits.childbirthLumpSum.reducedAmount)}）`,
        listAmount: `約${yen.format(healthBenefits.childbirthLumpSum.standardAmount)}`,
        accuracy: "高精度",
      };
    case "childcare-leave-benefit":
      return {
        estimatedAmount: childcareLeaveBenefitEstimate(monthly),
        listAmount: childcareLeaveBenefitListAmount(monthly),
        accuracy: "要確認",
      };
    case "family-care-leave-benefit":
      return {
        estimatedAmount: `${yen.format(monthlyEmploymentBenefit(monthly, employmentBenefits.familyCareLeaveBenefit))}/月（休業開始前6か月の賃金、休業日数、賃金支払い状況で変わります）`,
        listAmount: shortMonthlyAmount(
          monthlyEmploymentBenefit(
            monthly,
            employmentBenefits.familyCareLeaveBenefit,
          ),
        ),
        accuracy: "要確認",
      };
    case "burial-fee":
      return {
        estimatedAmount: `${yen.format(healthBenefits.burialFee.amount)}（国保は自治体の葬祭費を確認）`,
        listAmount: `約${yen.format(healthBenefits.burialFee.amount)}`,
        accuracy: input.insuranceStatus === "national" ? "要確認" : "高精度",
      };
    case "survivor-disability-pension":
      return { ...survivorPensionEstimate(input, standard), accuracy: "要確認" };
    case "disability-pension":
      return { ...disabilityPensionEstimate(input, standard), accuracy: "要確認" };
    default:
      return {
        estimatedAmount: "要確認",
        listAmount: "要確認",
        accuracy: "要確認",
      };
  }
}

function detailFor(id: string, input: UserInput) {
  const employee = input.insuranceStatus === "employee";
  const dependent = input.insuranceStatus === "dependent";
  const national = input.insuranceStatus === "national";
  const broad = input.insuranceStatus === "unknown";
  const common = `入力された加入状況は「${statusLabel(input.insuranceStatus)}」です。`;
  const map: Record<
    string,
    Omit<
      BenefitResult,
      keyof Benefit | "estimatedAmount" | "listAmount" | "accuracy" | "note"
    >
  > = {
    "standard-monthly-remuneration": {
      eligibilityPossibility: employee
        ? "勤務先の社会保険なら推定対象"
        : "会社員向けの参考値",
      reason: "傷病手当金・出産手当金・高額療養費区分の目安に使います。",
      variables: [
        "実際の標準報酬月額",
        "賞与の扱い",
        "定時決定・随時改定の時期",
      ],
      nextChecks: [
        "給与明細",
        "勤務先の標準報酬月額通知",
        "健康保険料の控除額",
      ],
    },
    "high-cost-medical-expense": {
      eligibilityPossibility: "健康保険を使う医療費なら対象になる可能性が高い",
      reason: "医療費が高額になった月の自己負担に上限が設けられるためです。",
      variables: [
        "年齢",
        "標準報酬月額または所得区分",
        "世帯合算",
        "多数回該当",
        "住民税非課税区分",
      ],
      nextChecks: [
        "健康保険証",
        "標準報酬月額",
        "限度額適用認定証",
        "加入先の付加給付",
      ],
    },
    "sickness-allowance": {
      eligibilityPossibility: employee
        ? "対象になる可能性が高い"
        : dependent || national
          ? "協会けんぽ等の被保険者本人でなければ対象外の可能性が高い"
          : "加入状況により対象外の場合があります",
      reason:
        "業務外の病気・けがで働けず給与が十分に出ないときの所得補償です。",
      variables: [
        "直近12か月の標準報酬月額",
        "待期3日",
        "給与支払い状況",
        "加入期間",
      ],
      nextChecks: [
        "給与明細",
        "標準報酬月額",
        "勤務先の休職時給与",
        "健康保険組合への確認",
      ],
    },
    "maternity-allowance": {
      eligibilityPossibility: employee
        ? "対象になる可能性が高い"
        : "本人が健康保険の被保険者でない場合は対象外または要確認",
      reason: "出産のため休業し給与が十分に出ない期間の所得補償です。",
      variables: [
        "直近12か月の標準報酬月額",
        "産前産後の日数",
        "給与支払い",
        "退職時期",
      ],
      nextChecks: [
        "給与明細",
        "標準報酬月額",
        "出産予定日",
        "勤務先の産休給与",
      ],
    },
    "child-allowance": {
      eligibilityPossibility: input.hasChildren
        ? "子どもの年齢により対象の可能性"
        : "子どもがいる場合に対象",
      reason: "高校生年代までの子を養育する世帯への定期給付です。",
      variables: ["子どもの年齢", "第何子か", "養育状況", "自治体手続き"],
      nextChecks: ["子どもの生年月日", "住民票のある自治体", "認定請求の期限"],
    },
    "childbirth-lump-sum": {
      eligibilityPossibility:
        national || employee || dependent || broad
          ? "出産時に対象となる可能性"
          : "要確認",
      reason: "健康保険加入者または被扶養者の出産費用を軽減する定額給付です。",
      variables: ["産科医療補償制度", "妊娠週数", "多胎", "直接支払制度の利用"],
      nextChecks: ["健康保険証", "出産予定の医療機関", "直接支払制度の書類"],
    },
    "childcare-leave-benefit": {
      eligibilityPossibility: employee
        ? "雇用保険加入なら対象の可能性"
        : "勤務先・雇用保険加入状況を要確認",
      reason: "育児休業中の賃金低下を雇用保険から補う制度です。",
      variables: [
        "雇用保険の加入期間",
        "休業前賃金",
        "育休取得期間",
        "賃金支払い",
      ],
      nextChecks: [
        "雇用保険被保険者証",
        "育休開始前6か月の賃金",
        "勤務先の育休制度",
      ],
    },
    "family-care-leave-benefit": {
      eligibilityPossibility: employee
        ? "雇用保険加入なら対象の可能性"
        : "勤務先・雇用保険加入状況を要確認",
      reason: "家族介護で休業する場合の収入減に備える制度です。",
      variables: ["対象家族", "介護状態", "雇用保険の加入期間", "休業日数"],
      nextChecks: [
        "雇用保険被保険者証",
        "介護対象者の状態",
        "勤務先の介護休業制度",
      ],
    },
    "burial-fee": {
      eligibilityPossibility: national
        ? "自治体の葬祭費を確認"
        : "埋葬関連給付の対象となる可能性",
      reason: "健康保険加入者・被扶養者の死亡時に埋葬費用を補う制度です。",
      variables: [
        "亡くなった人の加入先",
        "生計維持関係",
        "実際の埋葬費",
        "自治体制度",
      ],
      nextChecks: [
        "健康保険証",
        "加入先保険者",
        "自治体の葬祭費案内",
        "埋葬費の領収書",
      ],
    },
    "survivor-disability-pension": {
      eligibilityPossibility:
        input.hasChildren || employee
          ? "遺族基礎年金または遺族厚生年金の対象になる可能性"
          : "年金加入歴・保険料納付要件を要確認",
      reason: "死亡時に子のある配偶者または子、一定の遺族の生活を支える年金制度です。",
      variables: [
        "年金加入期間",
        "保険料納付要件",
        "配偶者・子どもの有無と年齢",
        "過去の標準報酬月額・賞与",
        "短期要件・長期要件",
        "子の障害等級",
      ],
      nextChecks: [
        "ねんきん定期便",
        "配偶者・子どもの情報",
        "子どもの生年月日",
        "障害等級に該当する子の有無",
        "年金事務所",
      ],
    },
    "disability-pension": {
      eligibilityPossibility: employee
        ? "障害等級に該当した場合、障害基礎年金または障害厚生年金の対象になる可能性"
        : "障害等級1級・2級に該当した場合、障害基礎年金の対象になる可能性",
      reason:
        "病気やけがで生活や仕事に大きな制限が残った場合に生活を支える年金制度です。",
      variables: [
        "初診日",
        "障害認定日",
        "保険料納付要件",
        "診断書",
        "障害等級の認定",
        "過去の標準報酬月額・賞与・加入月数",
        "配偶者加給年金額の停止要件",
      ],
      nextChecks: [
        "初診日が分かる資料",
        "診断書",
        "ねんきん定期便",
        "保険料納付状況",
        "年金事務所",
      ],
    },
  };
  const detail = map[id];
  return { ...detail, reason: `${common}${detail.reason}` };
}

function noteFor(input: UserInput, standard: number) {
  return `${input.age}歳、${statusLabel(input.insuranceStatus)}、年収/所得${yen.format(input.annualIncome)}、${estimatedMonthlyIncomeBasis(input)}、推定標準報酬月額${yen.format(standard)}でブラウザ内概算しました。厚生年金系の概算では標準報酬月額を${yen.format(PENSION_STANDARD_MONTHLY_MIN)}〜${yen.format(PENSION_STANDARD_MONTHLY_CAP)}の範囲に丸めて計算します。実際は加入先・勤務先・制度改正で変わります。`;
}
function withSource(benefit: BenefitCardData): Benefit {
  const source = sourceByBenefitId.get(benefit.id);
  if (!source)
    throw new Error(`Missing source data for benefit: ${benefit.id}`);
  return { ...benefit, ...source };
}
export function calculateBenefits(input: UserInput): BenefitResult[] {
  const standard = estimateStandardGrade(
    estimatedMonthlyIncome(input),
  ).standardMonthly;
  return (benefitCards as BenefitCardData[]).map((benefit) => ({
    ...withSource(benefit),
    ...amountAndAccuracy(benefit.id, input, standard),
    ...detailFor(benefit.id, input),
    note: noteFor(input, standard),
  }));
}
export const sourceBenefits = (benefitCards as BenefitCardData[]).map(
  withSource,
);
