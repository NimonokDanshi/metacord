'use client';

import { useEffect, useState } from 'react';
import { discordSdk } from '@/lib/discord';
import { useDiscordStore } from '@/store/discordStore';
import { DiscordUser } from '@/types/discord';
import { patchUrlMappings } from '@discord/embedded-app-sdk';

/**
 * Discord Activity のプロキシマッピング設定。
 *
 * Discord Activity は Discord のサンドボックス iframe 内で動作するため、
 * 外部ドメイン（supabase.co）への接続は Discord の CSP によってブロックされる。
 *
 * patchUrlMappings() は window.fetch / window.WebSocket / XMLHttpRequest を
 * モンキーパッチし、Supabase の URL を Discord プロキシ経由に自動書き換えする。
 *
 * ★ 事前に Discord Developer Portal の URL Mappings に以下を追加すること:
 *   Prefix: /supabase-rt
 *   Target: https://<あなたの project-ref>.supabase.co
 */
const URL_MAPPINGS = [
  {
    prefix: '/supabase-rt',
    target: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  },
];

export default function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setReady } = useDiscordStore();

  useEffect(() => {
    async function setupDiscord() {
      try {
        if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID) {
          throw new Error("環境変数 `NEXT_PUBLIC_DISCORD_CLIENT_ID` が設定されていません。");
        }

        // Step 1: Discordアプリ(iFrameの親)とのハンドシェイクを行う
        await discordSdk.ready();

        // Step 2: Discord CSP 対策 — URL プロキシマッピングを適用
        //
        // patchUrlMappings() は window.fetch / window.WebSocket / XMLHttpRequest を
        // グローバルにパッチし、Supabase への通信を自動的に
        // https://xxxx.discordsays.com/supabase-rt/... 経由に書き換える。
        //
        // これにより Supabase クライアントの再初期化は不要で、
        // 既存の `supabase` シングルトンがそのまま使える。
        //
        // ★ Developer Portal の URL Mappings に以下を追加してください:
        //   Prefix: /supabase-rt
        //   Target: https://<project-ref>.supabase.co
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          patchUrlMappings(URL_MAPPINGS, {
            patchFetch: true,
            patchWebSocket: true,
            patchXhr: true,
          });
          console.log('[DiscordProvider] URL プロキシマッピングを適用しました。');
        }

        // Step 3: Discord OAuth 認証を実施してアクセストークンを取得
        const { code } = await discordSdk.commands.authorize({
          client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify'],
        });

        // Step 4: アクセストークンをサーバーサイド経由で取得
        const tokenResponse = await fetch('/api/discord/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!tokenResponse.ok) {
          throw new Error('アクセストークンの取得に失敗しました。');
        }

        const { access_token } = await tokenResponse.json();

        // Step 5: アクセストークンでSDKを認証し、ユーザー情報を取得
        const auth = await discordSdk.commands.authenticate({ access_token });

        if (!auth || !auth.user) {
          throw new Error('Discord認証に失敗しました。');
        }

        // Step 6: 取得したユーザー情報をZustandストアに保存
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
  }, [setUser, setReady]);

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
