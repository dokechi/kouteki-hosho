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
- 制度データは `src/data/` 配下に役割ごとに分割した静的JSONから読みます。
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
    benefitCards.json           # 画面に表示する制度カード文言
    prefectures.json            # 入力フォームの都道府県選択肢
    standardRemuneration.json   # 標準報酬月額のMVP用仮等級データ
    highCostMedical.json        # 高額療養費のMVP用仮所得区分データ
    healthBenefits.json         # 健康保険系給付のMVP用仮計算パラメータ
    employmentBenefits.json     # 雇用保険系給付のMVP用仮計算パラメータ
    pensionBenefits.json        # 年金系カードのMVP用仮表示データ
    childAllowance.json         # 児童手当のMVP用仮計算パラメータ
    sources.json                # 出典名、出典URL、確認日、注意書き
  lib/
    calculator.ts     # 概算ロジック
    types.ts          # 型定義
```

## 制度データの追加場所

現時点のデータはMVP用の仮データであり、正式な制度計算ではありません。Excel/スプレッドシート由来の制度データを投入する場合は、役割ごとに以下のJSONへ分けて追加・修正してください。

- `src/data/benefitCards.json`: 制度カードの表示順、制度ID、場面、制度名、概要、金額ラベル、対象者の目安を入れます。
- `src/data/prefectures.json`: 入力フォームで選択する都道府県名を入れます。
- `src/data/standardRemuneration.json`: 標準報酬月額の等級・金額など、標準報酬月額推定に使うデータを入れます。
- `src/data/highCostMedical.json`: 高額療養費の所得区分や自己負担限度額表示に使うデータを入れます。
- `src/data/healthBenefits.json`: 傷病手当金、出産育児一時金、出産手当金、埋葬料など健康保険系給付の計算パラメータを入れます。
- `src/data/employmentBenefits.json`: 育児休業給付、介護休業給付など雇用保険系給付の計算パラメータを入れます。
- `src/data/pensionBenefits.json`: 遺族年金・障害年金など年金系カードの判定表示や計算パラメータを入れます。
- `src/data/childAllowance.json`: 児童手当の月額や子ども人数に応じた計算パラメータを入れます。
- `src/data/sources.json`: 制度IDごとに出典名、出典URL、確認日、注意書きを必ず入れます。

制度カードを追加する場合は、`benefitCards.json` と `sources.json` に同じ `id` のデータを追加してください。金額や判定の概算ロジックを変える場合は、分割JSONの値を優先して更新し、必要に応じて `src/lib/calculator.ts` の `estimateAmount` を更新します。

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

## CI

GitHub Actions で Pull Request と `main` ブランチへの push 時に CI を実行します。CI では Node.js 20 を使い、以下のコマンドを順番に実行します。

```bash
npm install
npm run typecheck
npm run build
```

ローカルで CI と同じ確認をする場合も、上記のコマンドを順番に実行してください。GitHub 上では Pull Request の Checks タブ、またはリポジトリの Actions タブから実行結果を確認できます。
