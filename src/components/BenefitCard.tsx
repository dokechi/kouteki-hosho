import type { BenefitResult } from "@/lib/types";

export function BenefitCard({ benefit }: { benefit: BenefitResult }) {
  return (
    <details className="benefitRow">
      <summary className="benefitSummary">
        <span className="benefitScene">{benefit.scene}</span>
        <span className="benefitName">{benefit.name}</span>
        <strong className="benefitAmount">{benefit.listAmount}</strong>
        <span className="benefitIcon" aria-hidden="true">▼</span>
      </summary>
      <div className="benefitDetail">
        <section>
          <h3>どんな制度か</h3>
          <p>{benefit.summary}</p>
        </section>
        <section>
          <h3>概算金額・目安額</h3>
          <p className="amountLine">{benefit.estimatedAmount}</p>
          <p className="small">目安の精度：{benefit.accuracy}</p>
        </section>
        <section>
          <h3>なぜ対象になる可能性があるのか</h3>
          <p>{benefit.eligibilityPossibility}</p>
          <p className="small">{benefit.reason}</p>
        </section>
        <section>
          <h3>実際の金額がズレる理由</h3>
          <ul>{benefit.variables.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <h3>次に確認すると精度が上がるもの</h3>
          <ul>{benefit.nextChecks.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <p className="small"><b>計算メモ：</b>{benefit.note}</p>
        <div className="sourceBox">
          <p><b>出典：</b><a href={benefit.sourceUrl} target="_blank" rel="noreferrer">{benefit.sourceName}</a></p>
          <p><b>確認日：</b>{benefit.checkedAt}</p>
          <p><b>注意：</b>{benefit.caution}</p>
        </div>
      </div>
    </details>
  );
}
