'use client';

import { useEffect, useState } from 'react';
import { discordSdk, setupDiscordProxy } from '@/lib/discord';
import { useDiscordStore } from '@/store/discordStore';
import { DiscordUser } from '@/types/discord';



export default function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, instanceId, channelId, guildId, isReady, setUser, setReady, setInfo } = useDiscordStore();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    async function setupDiscord() {
      try {
        if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID) {
          throw new Error('環境変数 NEXT_PUBLIC_DISCORD_CLIENT_ID が設定されていません。');
        }

        if (!discordSdk) {
          throw new Error('Discord 外のブラウザで起動されています。Discord ボイスチャンネルの『ロケットボタン』から起動してください。');
        }

        // Step 1: Discordアプリ(iFrameの親)とのハンドシェイクを行う
        console.log('[DiscordProvider] SDK の準備を開始します...');
        await discordSdk.ready();

        console.log('[DiscordProvider] SDK Ready!', {
          instanceId: discordSdk.instanceId,
          channelId: discordSdk.channelId,
          guildId: discordSdk.guildId,
        });

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
        console.log('[DiscordProvider] 認可コードを取得中...');
        const { code } = await discordSdk.commands.authorize({
          client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify'],
        });

        // Step 5: アクセストークンをサーバーサイド経由で取得
        console.log('[DiscordProvider] トークン交換中...', { code: code.substring(0, 5) + '...' });
        const tokenResponse = await fetch('/api/discord/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!tokenResponse.ok) {
          const errText = await tokenResponse.text();
          console.error('[DiscordProvider] トークン取得エラー:', errText);
          throw new Error(`アクセストークンの取得に失敗しました: ${tokenResponse.status}`);
        }

        const { access_token } = await tokenResponse.json();

        // Step 6: アクセストークンでSDKを認証し、ユーザー情報を取得
        console.log('[DiscordProvider] SDK を認証中...');
        const auth = await discordSdk.commands.authenticate({ access_token });

        if (!auth || !auth.user) {
          throw new Error('Discord認証に失敗しました。');
        }

        console.log('[DiscordProvider] 認証成功:', auth.user.username);

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
        console.error('[DiscordProvider] Error:', e);
        setError(e.message || 'Discordへの接続に失敗しました。');
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

  return (
    <>
      {children}

      {/* デバッグ情報表示ボタン (開発時のみ) */}
      <div className="fixed bottom-4 right-4 z-[9999]">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="bg-slate-800/80 hover:bg-slate-700 text-white text-[10px] px-2 py-1 rounded border border-slate-600 backdrop-blur-sm transition-colors"
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>

        {showDebug && (
          <div className="absolute bottom-10 right-0 w-80 bg-slate-950/90 border border-slate-700 rounded-lg p-4 text-[11px] font-mono text-emerald-400 shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-slate-400 font-bold mb-2 border-b border-slate-800 pb-1 flex justify-between items-center">
              <span>ZUSTAND STORE DEBUG</span>
              <span className={isReady ? 'text-emerald-500' : 'text-red-500'}>
                ● {isReady ? 'READY' : 'NOT READY'}
              </span>
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-slate-500">instanceId:</span> {instanceId || 'null'}
              </div>
              <div>
                <span className="text-slate-500">channelId:</span> {channelId || 'null'}
              </div>
              <div>
                <span className="text-slate-500">guildId:</span> {guildId || 'null'}
              </div>
              <div>
                <span className="text-slate-500">user:</span>
                <pre className="mt-1 p-2 bg-slate-900/50 rounded overflow-x-auto text-emerald-300">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
