'use client';

import dynamic from 'next/dynamic';

/**
 * GameCanvas を ssr: false で動的ロードするクライアントラッパー
 *
 * PixiJS はブラウザ専用ライブラリ（window/canvas を使用）のため
 * サーバーサイドレンダリングを無効にする必要がある。
 * Next.js App Router では、ssr: false は 'use client' コンポーネント内でのみ使用可能。
 */
const GameCanvas = dynamic(() => import('./GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-300 text-sm">ゲームエンジン初期化中...</p>
      </div>
    </div>
  ),
});

export default function GameCanvasLoader() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <GameCanvas />
    </div>
  );
}
