"use client";

import { useMemo, useState } from "react";
import { BenefitCard } from "@/components/BenefitCard";
import { calculateBenefits } from "@/lib/calculator";
import type { InsuranceStatus, UserInput } from "@/lib/types";

const incomeCopy: Record<InsuranceStatus, { label: string; help: string }> = {
  employee: { label: "年収", help: "勤務先からもらう税込年収を入力してください。ボーナス込み。副業・不動産・株の利益は含めません。" },
  national: { label: "年間所得の目安", help: "自営業・フリーランスの方は、売上ではなく経費を引いた後の金額に近いものを入力してください。" },
  dependent: { label: "本人の年収見込み", help: "扶養に入っている本人の年収を入力してください。" },
  unknown: { label: "年収", help: "分かる範囲で税込年収を入力してください。結果は概算として表示します。" },
};

export function InputForm() {
  const [input, setInput] = useState<UserInput>({
    age: 35,
    insuranceStatus: "employee",
    annualIncome: 5000000,
    hasSpouse: true,
    hasChildren: true,
    childrenCount: 1,
    childAges: [3],
  });
  const [submitted, setSubmitted] = useState(true);
  const results = useMemo(() => calculateBenefits(input), [input]);
  const income = incomeCopy[input.insuranceStatus];

  const updateNumber = (key: "age" | "annualIncome" | "childrenCount") => (value: string) => {
    const numberValue = Number(value);
    setInput((current) => {
      if (key !== "childrenCount") return { ...current, [key]: numberValue };
      const childrenCount = Math.max(0, numberValue);
      return { ...current, childrenCount, childAges: Array.from({ length: childrenCount }, (_, index) => current.childAges[index] ?? 0) };
    });
  };

  const updateHasChildren = (hasChildren: boolean) => {
    setInput((current) => ({
      ...current,
      hasChildren,
      childrenCount: hasChildren ? Math.max(1, current.childrenCount) : 0,
      childAges: hasChildren ? (current.childAges.length > 0 ? current.childAges : [0]) : [],
    }));
  };

  const updateChildAge = (index: number, value: string) => setInput((current) => ({
    ...current,
    childAges: current.childAges.map((age, currentIndex) => currentIndex === index ? Number(value) : age),
  }));

  return (
    <>
      <form className="formGrid" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <label>年齢<input type="number" min="0" value={input.age} onChange={(e) => updateNumber("age")(e.target.value)} /></label>
        <label>加入状況<select value={input.insuranceStatus} onChange={(e) => setInput({ ...input, insuranceStatus: e.target.value as InsuranceStatus })}>
          <option value="employee">勤務先の社会保険に入っている</option>
          <option value="dependent">家族の扶養に入っている</option>
          <option value="national">国民健康保険に入っている</option>
          <option value="unknown">よく分からない</option>
        </select><span className="helpText">給与明細で「健康保険料」「厚生年金保険料」が引かれている人は勤務先の社会保険です。</span></label>
        <label>{income.label}（円）<input type="number" min="0" step="10000" required value={input.annualIncome} onChange={(e) => updateNumber("annualIncome")(e.target.value)} /><span className="helpText">{income.help}</span></label>
        <label>配偶者の有無<select value={input.hasSpouse ? "yes" : "no"} onChange={(e) => setInput({ ...input, hasSpouse: e.target.value === "yes" })}><option value="yes">あり</option><option value="no">なし</option></select></label>
        <label>子どもの有無<select value={input.hasChildren ? "yes" : "no"} onChange={(e) => updateHasChildren(e.target.value === "yes")}><option value="yes">あり</option><option value="no">なし</option></select><span className="helpText">子ども関連の公的保障を確認するために使います。</span></label>
        {input.hasChildren && <label>子どもの人数<input type="number" min="1" max="10" value={input.childrenCount} onChange={(e) => updateNumber("childrenCount")(e.target.value)} /></label>}
        {input.hasChildren && input.childAges.map((age, index) => <label key={index}>子ども{index + 1}人目の年齢<input type="number" min="0" max="30" value={age} onChange={(e) => updateChildAge(index, e.target.value)} /></label>)}
        <button type="submit">結果を見る</button>
      </form>
      {submitted && (
        <section className="resultSection">
          <h2 className="resultTitle">あれ、自分って<br />最初からこんな保障持ってたんだ。</h2>
          <p className="resultLead">入力内容から、あなたが使える可能性のある公的保障をまとめました。</p>
          <p className="notice">金額は入力内容からの概算です。まずは「どんな場面で使えるか」を一覧で見て、気になる行を開いて確認してください。</p>
          <div className="results" aria-label="使える可能性がある公的保障の一覧">{results.map((benefit) => <BenefitCard key={benefit.id} benefit={benefit} />)}</div>
        </section>
      )}
    </>
  );
}
