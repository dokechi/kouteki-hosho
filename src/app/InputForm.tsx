"use client";

import { useMemo, useState } from "react";
import { BenefitCard } from "@/components/BenefitCard";
import { calculateBenefits } from "@/lib/calculator";
import type { InsuranceStatus, UserInput } from "@/lib/types";

const incomeCopy: Record<InsuranceStatus, { label: string; help: string }> = {
  employee: { label: "年収", help: "税込の年収を入力してください。ボーナス込みでOKです。" },
  national: { label: "年間所得の目安", help: "売上から経費を引いた金額を入力してください。" },
  dependent: { label: "本人の年収見込み", help: "扶養に入っている本人の年収を入力してください。" },
  unknown: { label: "年収", help: "分かる範囲の税込年収を入力してください。" },
};

type SelectValue = "" | "yes" | "no";

type FormInput = {
  age: string;
  insuranceStatus: "" | InsuranceStatus;
  annualIncome: string;
  hasSpouse: SelectValue;
  hasChildren: SelectValue;
  childrenCount: string;
  childAges: string[];
};

const initialInput: FormInput = {
  age: "",
  insuranceStatus: "",
  annualIncome: "",
  hasSpouse: "",
  hasChildren: "",
  childrenCount: "",
  childAges: [],
};

const toNumber = (value: string) => {
  if (value.trim() === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

function validateInput(input: FormInput): { errors: string[]; userInput: UserInput | null } {
  const errors: string[] = [];
  const age = toNumber(input.age);
  const annualIncome = toNumber(input.annualIncome);
  const childrenCount = toNumber(input.childrenCount);

  if (age === null || age < 0) errors.push("年齢を入力してください");
  if (!input.insuranceStatus) errors.push("加入状況を選んでください");
  if (annualIncome === null || annualIncome < 0) errors.push("年収を入力してください");
  if (!input.hasSpouse) errors.push("配偶者の有無を選んでください");
  if (!input.hasChildren) errors.push("子どもの有無を選んでください");

  const hasChildren = input.hasChildren === "yes";
  if (hasChildren) {
    if (childrenCount === null || childrenCount < 1 || childrenCount > 10 || !Number.isInteger(childrenCount)) errors.push("子どもの人数を入力してください");

    const childAges = input.childAges.slice(0, childrenCount ?? 0).map(toNumber);
    if (childAges.length === 0 || childAges.some((childAge) => childAge === null || childAge < 0)) errors.push("子どもの年齢を入力してください");

    if (errors.length === 0) {
      return {
        errors,
        userInput: {
          age: age!,
          insuranceStatus: input.insuranceStatus as InsuranceStatus,
          annualIncome: annualIncome!,
          hasSpouse: input.hasSpouse === "yes",
          hasChildren,
          childrenCount: childrenCount!,
          childAges: childAges as number[],
        },
      };
    }
  }

  if (errors.length > 0) return { errors, userInput: null };

  return {
    errors,
    userInput: {
      age: age!,
      insuranceStatus: input.insuranceStatus as InsuranceStatus,
      annualIncome: annualIncome!,
      hasSpouse: input.hasSpouse === "yes",
      hasChildren,
      childrenCount: 0,
      childAges: [],
    },
  };
}

export function InputForm() {
  const [input, setInput] = useState<FormInput>(initialInput);
  const [errors, setErrors] = useState<string[]>([]);
  const [validatedInput, setValidatedInput] = useState<UserInput | null>(null);
  const results = useMemo(() => validatedInput ? calculateBenefits(validatedInput) : [], [validatedInput]);
  const income = input.insuranceStatus ? incomeCopy[input.insuranceStatus] : incomeCopy.unknown;

  const updateNumber = (key: "age" | "annualIncome" | "childrenCount") => (value: string) => {
    setInput((current) => {
      if (key !== "childrenCount") return { ...current, [key]: value };
      const childrenCount = toNumber(value);
      return {
        ...current,
        childrenCount: value,
        childAges: childrenCount && childrenCount > 0 && Number.isInteger(childrenCount)
          ? Array.from({ length: Math.min(childrenCount, 10) }, (_, index) => current.childAges[index] ?? "")
          : [],
      };
    });
  };

  const updateHasChildren = (hasChildren: SelectValue) => {
    setInput((current) => ({
      ...current,
      hasChildren,
      childrenCount: hasChildren === "yes" ? current.childrenCount : "",
      childAges: hasChildren === "yes" ? current.childAges : [],
    }));
  };

  const updateChildAge = (index: number, value: string) => setInput((current) => ({
    ...current,
    childAges: current.childAges.map((age, currentIndex) => currentIndex === index ? value : age),
  }));

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateInput(input);
    setErrors(validation.errors);
    setValidatedInput(validation.userInput);
  };

  return (
    <>
      <form className="formGrid" onSubmit={submitForm} noValidate>
        <label>年齢<input type="number" min="0" placeholder="例：31" value={input.age} onChange={(e) => updateNumber("age")(e.target.value)} /></label>
        <label>加入状況<select value={input.insuranceStatus} onChange={(e) => setInput({ ...input, insuranceStatus: e.target.value as FormInput["insuranceStatus"] })}>
          <option value="">選択してください</option>
          <option value="employee">会社の社会保険に入っている</option>
          <option value="dependent">家族の扶養に入っている</option>
          <option value="national">国民健康保険に入っている</option>
          <option value="unknown">よく分からない</option>
        </select><span className="helpText">給与明細で保険料が引かれている方は、会社の社会保険を選んでください。</span></label>
        <label>{income.label}（円）<input type="number" min="0" step="10000" placeholder="例：4000000" value={input.annualIncome} onChange={(e) => updateNumber("annualIncome")(e.target.value)} /><span className="helpText">{income.help}</span></label>
        <label>配偶者の有無<select value={input.hasSpouse} onChange={(e) => setInput({ ...input, hasSpouse: e.target.value as SelectValue })}><option value="">選択してください</option><option value="yes">あり</option><option value="no">なし</option></select></label>
        <label>子どもの有無<select value={input.hasChildren} onChange={(e) => updateHasChildren(e.target.value as SelectValue)}><option value="">選択してください</option><option value="yes">あり</option><option value="no">なし</option></select><span className="helpText">子ども向けの制度を確認するために使います。</span></label>
        {input.hasChildren === "yes" && <label>子どもの人数<input type="number" min="1" max="10" placeholder="例：1" value={input.childrenCount} onChange={(e) => updateNumber("childrenCount")(e.target.value)} /></label>}
        {input.hasChildren === "yes" && input.childAges.map((age, index) => <label key={index}>子ども{index + 1}人目の年齢<input type="number" min="0" max="30" placeholder="例：3" value={age} onChange={(e) => updateChildAge(index, e.target.value)} /></label>)}
        {errors.length > 0 && <div className="errorBox" role="alert"><p>入力内容を確認してください。</p><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        <button type="submit">結果を見る</button>
      </form>
      {validatedInput && (
        <section className="resultSection">
          <h2 className="resultTitle">あれ、自分って<br />最初からこんな保障持ってたんだ。</h2>
          <p className="resultLead">入力内容から、あなたが使える可能性のある公的保障をまとめました。</p>
          <p className="notice">金額は概算です。まずは「どんな場面で使えるか」を一覧で見て、気になる行を開いて確認してください。</p>
          <div className="results" aria-label="使える可能性がある公的保障の一覧">{results.map((benefit) => <BenefitCard key={benefit.id} benefit={benefit} />)}</div>
        </section>
      )}
    </>
  );
}
