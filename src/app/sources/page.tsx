import { sourceBenefits } from "@/lib/calculator";

export default function SourcesPage() {
  return (
    <section>
      <h1>出典一覧</h1>
      <p>
        各制度カードで使用している出典情報です。制度内容や金額は改正される場合があるため、最新情報は各リンク先で確認してください。
      </p>
      <ol className="sourceList">
        {sourceBenefits.map((benefit) => (
          <li key={benefit.id}>
            <b>{benefit.name}</b>：
            {benefit.sourceLinks ? (
              <ul>
                {benefit.sourceLinks.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">{source.name}</a>
                  </li>
                ))}
              </ul>
            ) : (
              <a href={benefit.sourceUrl} target="_blank" rel="noreferrer">{benefit.sourceName}</a>
            )}
            （確認日：{benefit.checkedAt}）<br />
            <span>{benefit.caution}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
