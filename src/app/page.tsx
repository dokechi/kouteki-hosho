import { InputForm } from "./InputForm";

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">公的保障の目安確認</p>
        <h1>使える可能性のある公的保障を、かんたんに確認できます。</h1>
        <p className="lead">
          年齢・年収・加入状況・家族構成を入力すると、病気や出産、子育てなどの場面で確認したい制度を一覧で見られます。
        </p>
        <p className="heroNote">
          保険販売や勧誘ではありません。金額は概算のため、詳細は公式情報で確認してください。
        </p>
      </section>
      <section id="diagnosis" className="diagnosisSection" aria-labelledby="diagnosis-title">
        <p className="sectionLabel">入力は数項目です</p>
        <h2 id="diagnosis-title">入力フォーム</h2>
        <p className="sectionLead">分からない項目は「よく分からない」を選んでも確認できます。</p>
        <InputForm />
      </section>
    </>
  );
}
