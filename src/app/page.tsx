import Link from "next/link";
import { InputForm } from "./InputForm";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>病気・ケガ・失業・出産・介護。使える国の制度を一発確認</h1>
        <Link className="button" href="#diagnosis">診断をはじめる</Link>
      </section>
      <section id="diagnosis">
        <h2>入力フォーム</h2>
        <InputForm />
      </section>
    </>
  );
}
