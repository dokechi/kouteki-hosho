"use client";

import { useMemo, useState } from "react";
import { BenefitCard } from "@/components/BenefitCard";
import { calculateBenefits } from "@/lib/calculator";
import type { Household, UserInput } from "@/lib/types";

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

export function InputForm() {
  const [input, setInput] = useState<UserInput>({
    age: 35,
    prefecture: "東京都",
    annualIncome: 5000000,
    monthlySalary: 320000,
    healthInsurancePremium: 16000,
    pensionPremium: 30000,
    household: "withChildren",
    children: 1,
  });
  const [submitted, setSubmitted] = useState(false);
  const results = useMemo(() => calculateBenefits(input), [input]);

  const updateNumber = (key: keyof UserInput) => (value: string) =>
    setInput((current) => ({ ...current, [key]: Number(value) }));

  return (
    <>
      <form className="formGrid" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <label>年齢<input type="number" min="18" value={input.age} onChange={(e) => updateNumber("age")(e.target.value)} /></label>
        <label>都道府県<select value={input.prefecture} onChange={(e) => setInput({ ...input, prefecture: e.target.value })}>{prefectures.map((pref) => <option key={pref}>{pref}</option>)}</select></label>
        <label>年収（円）<input type="number" min="0" step="10000" value={input.annualIncome} onChange={(e) => updateNumber("annualIncome")(e.target.value)} /></label>
        <label>月給（円）<input type="number" min="0" step="1000" value={input.monthlySalary} onChange={(e) => updateNumber("monthlySalary")(e.target.value)} /></label>
        <label>健康保険料（円/月）<input type="number" min="0" step="100" value={input.healthInsurancePremium} onChange={(e) => updateNumber("healthInsurancePremium")(e.target.value)} /></label>
        <label>厚生年金保険料（円/月）<input type="number" min="0" step="100" value={input.pensionPremium} onChange={(e) => updateNumber("pensionPremium")(e.target.value)} /></label>
        <label>家族構成<select value={input.household} onChange={(e) => setInput({ ...input, household: e.target.value as Household })}><option value="single">単身</option><option value="couple">夫婦</option><option value="withChildren">子どもあり</option><option value="caregiving">介護家族あり</option></select></label>
        <label>子どもの人数<input type="number" min="0" value={input.children} onChange={(e) => updateNumber("children")(e.target.value)} /></label>
        <button type="submit">結果を見る</button>
      </form>
      {submitted && (
        <section>
          <h2>診断結果カード一覧</h2>
          <p className="notice">
            表示される制度金額・計算ロジックはMVP検証用の仮データです。正式な制度計算ではありません。
          </p>
          <div className="results">{results.map((benefit) => <BenefitCard key={benefit.id} benefit={benefit} />)}</div>
        </section>
      )}
    </>
  );
}
