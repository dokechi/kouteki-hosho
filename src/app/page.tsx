import Link from "next/link";
import { InputForm } from "./InputForm";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>もしもの時に使える公的保障を、場面別に見える化。</h1>
        <p className="lead">協会けんぽ加入の会社員向けMVPです。年齢・年収・月給・家族構成などから、使える可能性のある制度をブラウザ内で概算表示します。</p>
        <p className="notice">入力データは保存しません。ログイン・データベース・サーバー側計算はありません。制度データは静的JSONから読み込みます。</p>
        <Link className="button" href="#diagnosis">診断をはじめる</Link>
      </section>
      <section id="diagnosis">
        <h2>入力フォーム</h2>
        <InputForm />
      </section>
    </>
  );
}
