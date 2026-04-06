'use client';

import { useEffect, useState } from 'react';
import { discordSdk, setupDiscordProxy } from '@/lib/discord';
import { useDiscordStore } from '@/store/discordStore';
import { DiscordUser, DiscordChannel, VoiceState } from '@/types/discord';



export default function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    user, instanceId, channelId, guildId, voiceStates, isReady, 
    setUser, setReady, setInfo, setVoiceStates, updateVoiceState 
  } = useDiscordStore();
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
          scope: ['identify', 'guilds.members.read'],
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
          avatar: auth.user.avatar,
          global_name: auth.user.global_name,
        };
        setUser(discordUser);

        // Step 8: ボイスチャンネルの初期ユーザーリストを取得
        if (discordSdk.channelId) {
          try {
            const channel: DiscordChannel = await discordSdk.commands.getChannel({ 
              channel_id: discordSdk.channelId 
            });
            console.log('[DiscordProvider] チャンネル情報取得成功:', channel.name);
            setVoiceStates(channel.voice_states);
          } catch (e) {
            console.warn('[DiscordProvider] チャンネル情報の取得に失敗しました:', e);
          }

          // Step 9: ボイスステートの更新を購読
          discordSdk.subscribe('VOICE_STATE_UPDATE', (event: any) => {
            console.log('[DiscordProvider] VOICE_STATE_UPDATE:', event);
            // event は VoiceState 型に準拠したデータを含む
            updateVoiceState(event);
          }, { channel_id: discordSdk.channelId });
        }

        setReady(true);
        setIsConnected(true);
      } catch (e: any) {
        console.error('[DiscordProvider] Error:', e);
        setError(e.message || 'Discordへの接続に失敗しました。');
      }
    }

    setupDiscord();

    return () => {
      // クリーンアップ処理
      const currentChannelId = discordSdk?.channelId;
      if (discordSdk && currentChannelId) {
        discordSdk.unsubscribe('VOICE_STATE_UPDATE', () => {}, { channel_id: currentChannelId });
      }
    };
  }, [setUser, setReady, setInfo, setVoiceStates, updateVoiceState]);

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
          className="bg-slate-800/80 hover:bg-slate-700 text-white text-[10px] px-2 py-1 rounded border border-slate-600 backdrop-blur-sm transition-colors shadow-lg"
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>

        {showDebug && (
          <div className="absolute bottom-10 right-0 w-80 max-h-[80vh] bg-slate-950/90 border border-slate-700 rounded-lg p-4 text-[11px] font-mono text-emerald-400 shadow-2xl backdrop-blur-md overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-slate-400 font-bold mb-2 border-b border-slate-800 pb-1 flex justify-between items-center">
              <span>ZUSTAND STORE DEBUG</span>
              <span className={isReady ? 'text-emerald-500' : 'text-red-500'}>
                ● {isReady ? 'READY' : 'NOT READY'}
              </span>
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-slate-500 mb-1">Context:</h4>
                <div className="pl-2 border-l border-slate-800">
                  <div>instanceId: {instanceId || 'null'}</div>
                  <div>channelId: {channelId || 'null'}</div>
                  <div>guildId: {guildId || 'null'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-slate-500 mb-1">Current User:</h4>
                <pre className="p-2 bg-slate-900/50 rounded overflow-x-auto text-emerald-300">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="text-slate-500 mb-1 flex justify-between">
                  <span>Voice States:</span>
                  <span className="text-emerald-600">{voiceStates.length} users</span>
                </h4>
                <div className="space-y-1">
                  {voiceStates.map((vs) => (
                    <div key={vs.user.id} className="p-1 px-2 bg-slate-900/30 rounded border border-slate-800/50 flex justify-between items-center">
                      <span className="truncate max-w-[120px]">{vs.user.global_name || vs.user.username}</span>
                      <span className="flex gap-2">
                        {vs.voice_state.self_mute && <span title="Muted">🔇</span>}
                        {vs.voice_state.self_deaf && <span title="Deafened">🎧❌</span>}
                      </span>
                    </div>
                  ))}
                  {voiceStates.length === 0 && <div className="text-slate-600 italic">No data</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
