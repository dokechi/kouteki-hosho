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
        <span className="accuracy">精度：{benefit.accuracy}</span>
      </div>
      <p className="small"><b>対象になる可能性：</b>{benefit.eligibilityPossibility}</p>
      <p className="small"><b>なぜ関係するのか：</b>{benefit.reason}</p>
      <div className="detailBox">
        <p><b>実際の金額が変わる主な理由</b></p>
        <ul>{benefit.variables.map((item) => <li key={item}>{item}</li>)}</ul>
        <p><b>より正確に確認するなら</b></p>
        <ul>{benefit.nextChecks.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <p className="small"><b>計算メモ：</b>{benefit.note}</p>
      <div className="sourceBox">
        <p><b>出典：</b><a href={benefit.sourceUrl} target="_blank" rel="noreferrer">{benefit.sourceName}</a></p>
        <p><b>確認日：</b>{benefit.checkedAt}</p>
        <p><b>注意：</b>{benefit.caution}</p>
      </div>
    </article>
  );
}
