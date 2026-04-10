# Metacord (仮)

Discordの音声/テキストチャンネルと連動し、参加者が同一の仮想空間（カイロソフト風デザインの2Dドット絵の部屋）に集まっているかのような体験を提供するWebアプリケーションです。

## 技術スタック
- **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript
- **Graphics (2D描画)**: PixiJS (`pixi.js`, `@pixi/react`)
- **State Management (状態管理)**: Zustand
- **Backend / Realtime**: Supabase (`@supabase/supabase-js`)

## ディレクトリ構成（プロジェクト構造）

Next.js (App Router) の公式のディレクトリベストプラクティスに基づき、整理・分割しています。

```text
metacord/
├── src/
│   ├── app/           # App Routerのルーティングと各ページのレイアウト
│   ├── components/    # 再利用可能なReactコンポーネント (UIパーツや独立した描画領域)
│   ├── constants/     # アイテムIDや配置情報など、システム全体の不変マスタデータ
│   ├── hooks/         # 再利用可能なカスタム React Hooks
│   ├── lib/           # Supabase初期化やDiscord SDK連携などの外部ツール・ライブラリ設定
│   └── types/         # TypeScript の型定義（Databaseの型や共通Interface）
├── document/          # [Local Only] プロジェクトの各種設計ドキュメント
└── public/            # 静的アセット（画像ファイル等）
```

## 開発環境の立ち上げ手順

1. 依存パッケージのインストール
```bash
npm install
```

2. 開発サーバーの起動
```bash
npm run dev
```

3. 動作確認
ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスすると、ローカル環境でアプリが動作していることを確認できます。

## デプロイと環境構成

本プロジェクトは、開発（Dev）と本番（Prod）の環境が高精度に分離されています。

### 1. 環境構成図
- **Local**: ローカルPCで動作。開発用 Supabase への直接接続、または Supabase CLI による各操作。
- **Dev (branch: `dev`)**: 開発環境。Push すると **Vercel (Preview)** に自動デプロイ。
- **Prod (branch: `main`)**: 本番環境。Push すると **GitHub Actions** が以下の順で処理：
  1. Supabase のデータベース・マイグレーションを適用
  2. Supabase の Edge Functions をデプロイ
  3. Vercel (Production) に自動デプロイ

### 2. Supabase 接続情報の確認方法 (GitHub Secrets 用)
GitHub Actions の設定に必要な情報は、Supabase ダッシュボードから取得できます。

- **Project ID**: `Project Settings` > `General` > **Reference ID**
- **DB Password**: プロジェクト作成時に設定したパスワード。
  - *忘れた場合*: `Database` > `Database Settings` > `Database Password` > **Reset password** からリセット可能。
- **Access Token**: [Supabase Access Tokens](https://supabase.com/dashboard/account/tokens) から生成。

---

## 開発・運用フロー（マイグレーション）

データベースのスキーマ変更（テーブル追加、カラム変更、RLSポリシーの更新など）を行う際は、以下のフローを推奨します。

1. **マイグレーションファイルの生成**
   ```bash
   npx supabase migration new [チケット名や変更内容]
   ```
2. **SQLの記述**
   `supabase/migrations/` 配下に生成されたファイルに、実行したい SQL 操作（CREATE TABLE等）を記述します。
3. **リポジトリへの反映**
   ファイルをコミットし、`dev` ブランチで動作確認を行った後、`main` ブランチへマージします。
4. **本番適用**
   `main` ブランチへのマージを検知した GitHub Actions が、本番プロジェクトへ安全にマイグレーションを適用します。

> [!TIP]
> 既存の開発プロジェクトで **401 Unauthorized** が発生している場合は、`document/fix_401_rls.sql` の内容を開発環境の SQL Editor で一度実行してください。

## 設計ドキュメント

プロジェクトのコンセプトやデータスキーマ等の詳細な設計・仕様については、ローカルの `document/` ディレクトリ配下にある各Markdownファイルをご参照ください。（※機密性のため、設計書は `.gitignore` によりGitHub上には公開されない設定となっています）
