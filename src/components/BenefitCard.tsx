import type { BenefitResult } from "@/lib/types";

export function BenefitCard({ benefit }: { benefit: BenefitResult }) {
  return (
    <article className="card">
      <p className="scene">{benefit.scene}</p>
      <h3>{benefit.name}</h3>
      <p>{benefit.summary}</p>
      <div className="amountBox">
        <span>{benefit.baseAmountLabel}</span>
        <strong>{benefit.estimatedAmount}</strong>
      </div>
      <p className="small"><b>対象の目安：</b>{benefit.eligibilityHint}</p>
      <p className="small"><b>計算メモ：</b>{benefit.note}</p>
      <div className="sourceBox">
        <p><b>出典：</b><a href={benefit.sourceUrl} target="_blank" rel="noreferrer">{benefit.sourceName}</a></p>
        <p><b>確認日：</b>{benefit.checkedAt}</p>
        <p><b>注意：</b>{benefit.caution}</p>
      </div>
    </article>
  );
}
