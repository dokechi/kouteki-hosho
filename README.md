# 公的保障見える化 MVP

協会けんぽ加入の会社員向けに、年齢・都道府県・年収・月給・保険料・家族構成を入力すると、使える可能性のある公的保障をカード形式で表示するNext.js + TypeScriptアプリです。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 主な制約

- 現時点ではMVP用の仮データであり、正式な制度計算ではありません。
- 入力データは保存しません。
- ログイン機能はありません。
- データベースは使いません。
- 計算はブラウザ内で行います。
- AIに計算させません。
- 制度データは `src/data/benefits.json` の静的JSONから読みます。
- 教育費、生活費、必要保障額、自治体制度、健保組合独自給付は初期版では扱いません。

## ファイル構成

```text
src/
  app/
    page.tsx          # トップページ、入力フォーム、診断結果表示
    InputForm.tsx     # ブラウザ内で動く入力フォーム
    sources/page.tsx  # 出典一覧ページ
    layout.tsx        # 共通レイアウト
    globals.css       # スマホファーストの最小スタイル
  components/
    BenefitCard.tsx   # 診断結果カード
  data/
    benefits.json     # 制度カードの静的データ
  lib/
    calculator.ts     # 概算ロジック
    types.ts          # 型定義
```

## 制度データの追加場所

制度カードを追加・修正する場合は、まず `src/data/benefits.json` に制度名、場面、説明、出典名、出典URL、確認日、注意書きを追加してください。

金額や判定の概算ロジックを変える場合は、`src/lib/calculator.ts` の `estimateAmount` を更新します。

## 初期カード

- 推定標準報酬月額
- 高額療養費
- 傷病手当金
- 児童手当
- 出産育児一時金
- 出産手当金
- 育児休業給付
- 介護休業給付
- 埋葬料
- 遺族年金・障害年金（概算・要確認）
