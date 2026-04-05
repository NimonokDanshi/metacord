'use client';

import { useEffect, useState } from 'react';
import { discordSdk, setupDiscordProxy } from '@/lib/discord';
import { useDiscordStore } from '@/store/discordStore';
import { DiscordUser } from '@/types/discord';



export default function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setReady, setInfo } = useDiscordStore();

  useEffect(() => {
    async function setupDiscord() {
      try {
        if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID) {
          throw new Error("環境変数 `NEXT_PUBLIC_DISCORD_CLIENT_ID` が設定されていません。");
        }

        // Step 1: Discordアプリ(iFrameの親)とのハンドシェイクを行う
        await discordSdk.ready();

        // Step 2: Discord CSP 対策 — URL プロキシマッピングを適用
        setupDiscordProxy();
        console.log('[DiscordProvider] URL プロキシマッピングを適用しました。');

        // Step 3: インスタンス情報を保存
        setInfo({
          instanceId: discordSdk.instanceId,
          channelId: discordSdk.channelId,
          guildId: discordSdk.guildId,
        });

        // Step 4: Discord OAuth 認証を実施してアクセストークンを取得
        const { code } = await discordSdk.commands.authorize({
          client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify'],
        });

        // Step 5: アクセストークンをサーバーサイド経由で取得
        const tokenResponse = await fetch('/api/discord/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!tokenResponse.ok) {
          throw new Error('アクセストークンの取得に失敗しました。');
        }

        const { access_token } = await tokenResponse.json();

        // Step 6: アクセストークンでSDKを認証し、ユーザー情報を取得
        const auth = await discordSdk.commands.authenticate({ access_token });

        if (!auth || !auth.user) {
          throw new Error('Discord認証に失敗しました。');
        }

        // Step 7: 取得したユーザー情報をZustandストアに保存
        const discordUser: DiscordUser = {
          id: auth.user.id,
          username: auth.user.username,
          discriminator: auth.user.discriminator,
          avatar: auth.user.avatar ?? null,
          global_name: auth.user.global_name ?? null,
        };
        setUser(discordUser);
        setReady(true);
        setIsConnected(true);

      } catch (e: any) {
        setError(e.message || "Discordへの接続に失敗しました（またはDiscord以外のブラウザで表示しています）");
      }
    }

    setupDiscord();
  }, [setUser, setReady, setInfo]);

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
        <p className="text-blue-200">Discord と接続中...</p>
      </div>
    );
  }

  return <>{children}</>;
}
