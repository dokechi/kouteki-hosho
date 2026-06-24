import { InputForm } from "./InputForm";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>ザクっと俺の公的保障ってなに？</h1>
      </section>
      <section id="diagnosis">
        <h2>入力フォーム</h2>
        <InputForm />
      </section>
    </>
  );
}
