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

## デプロイについて

本プロジェクトは Vercel へのデプロイを前提としてアーキテクチャが設計されています。
このリポジトリの `main` ブランチへコードを `push` することで、Vercel経由で自動デプロイ（オートデプロイ）が走るようになっています。

## 設計ドキュメント

プロジェクトのコンセプトやデータスキーマ等の詳細な設計・仕様については、ローカルの `document/` ディレクトリ配下にある各Markdownファイルをご参照ください。（※機密性のため、設計書は `.gitignore` によりGitHub上には公開されない設定となっています）
