'use client';

import { useEffect, useState } from 'react';
import { discordSdk } from '@/lib/discord';

export default function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupDiscord() {
      try {
        if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID) {
          throw new Error("環境変数 `NEXT_PUBLIC_DISCORD_CLIENT_ID` が設定されていません。");
        }
        
        // Discordアプリ(iFrameの親)とのハンドシェイクを行う
        await discordSdk.ready();
        
        setIsConnected(true);
      } catch (e: any) {
        // 通常のブラウザから直接開いた場合などはエラーになります
        setError(e.message || "Discordへの接続に失敗しました（またはDiscord以外のブラウザで表示しています）");
      }
    }

    setupDiscord();
  }, []);

  // エラー画面
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="bg-red-900/50 border border-red-500 rounded p-6 max-w-lg text-center shadow-xl">
          <h1 className="text-xl font-bold text-red-400 mb-2">⚠️ 通信エラー</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            ※MetacordはDiscord上のアクティビティとして起動する必要があります。
          </p>
        </div>
      </div>
    );
  }

  // ローディング画面
  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-200">Discord とハンドシェイク中...</p>
      </div>
    );
  }

  // 接続成功時は中身（アプリ画面本体）を描画する
  return <>{children}</>;
}
