import { sourceBenefits } from "@/lib/calculator";

export default function SourcesPage() {
  return (
    <section>
      <h1>出典一覧</h1>
      <ol className="sourceList">
        {sourceBenefits.map((benefit) => (
          <li key={benefit.id}>
            <b>{benefit.name}</b>：<a href={benefit.sourceUrl} target="_blank" rel="noreferrer">{benefit.sourceName}</a>（確認日：{benefit.checkedAt}）<br />
            <span>{benefit.caution}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
