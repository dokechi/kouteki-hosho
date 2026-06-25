import calculationNotes from "@/data/calculationNotes.json";
import type { BenefitResult } from "@/lib/types";

type CalculationNote = {
  title: string;
  body: string;
};

const notesByBenefitId = calculationNotes as Record<string, CalculationNote[]>;

export function BenefitCard({ benefit }: { benefit: BenefitResult }) {
  const hasSourceLinks = Boolean(benefit.sourceLinks?.length);
  const notes = notesByBenefitId[benefit.id] ?? [];

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
          {benefit.amountBreakdown && (
            <ul>
              {benefit.amountBreakdown.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          {benefit.supplementalNotice && <p className="small">{benefit.supplementalNotice}</p>}
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
        {notes.length > 0 && (
          <section className="calculationNotes" aria-labelledby={`calculation-notes-${benefit.id}`}>
            <h3 id={`calculation-notes-${benefit.id}`}>この計算の見方</h3>
            <div className="calculationNoteList">
              {notes.map((note) => (
                <article className="calculationNote" key={note.title}>
                  <h4>{note.title}</h4>
                  <p>{note.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        <div className="sourceBox">
          <p><b>出典：</b></p>
          {hasSourceLinks ? (
            <ul>
              {benefit.sourceLinks?.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">{source.name}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p><a href={benefit.sourceUrl} target="_blank" rel="noreferrer">{benefit.sourceName}</a></p>
          )}
          <p><b>確認日：</b>{benefit.checkedAt}</p>
          <p><b>注意：</b>{benefit.caution}</p>
        </div>
      </div>
    </details>
  );
}
