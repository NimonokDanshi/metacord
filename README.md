# Metacord (仮)

Discordの音声/テキストチャンネルと連動し、参加者が同一の仮想空間（カイロソフト風デザインの2Dドット絵の部屋）に集まっているかのような体験を提供するWebアプリケーションです。

## 技術スタック
- **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript
- **Graphics (2D描画)**: PixiJS (`pixi.js`, `@pixi/react`)
- **State Management (状態管理)**: Zustand
- **Backend / Realtime**: Supabase (`@supabase/supabase-js`)

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
