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
    rawChannelData, logMessages,
    setUser, setReady, setInfo, setVoiceStates, updateVoiceState, removeVoiceState,
    setRawChannelData, addLogMessage
  } = useDiscordStore();
  const [showDebug, setShowDebug] = useState(false);

  // 簡易ログ出力関数
  const log = (msg: string, data?: any) => {
    const time = new Date().toLocaleTimeString();
    const fullMsg = `[${time}] ${msg}`;
    console.log(fullMsg, data);
    addLogMessage(fullMsg + (data ? ` ${JSON.stringify(data).substring(0, 50)}...` : ''));
  };

  useEffect(() => {
    async function setupDiscord() {
      let handleVoiceStateUpdate: ((event: any) => void) | null = null;
      let pollInterval: NodeJS.Timeout | null = null;

      try {
        if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID) {
          throw new Error('環境変数 NEXT_PUBLIC_DISCORD_CLIENT_ID が設定されていません。');
        }

        if (!discordSdk) {
          log('SDK が見つかりません。Discord 内で起動してください。');
          return;
        }

        log('SDK の準備を開始します...');
        await discordSdk.ready();

        log('SDK Ready!', {
          instanceId: discordSdk.instanceId,
          channelId: discordSdk.channelId,
          guildId: discordSdk.guildId,
        });

        setupDiscordProxy();
        setInfo({
          instanceId: discordSdk.instanceId,
          channelId: discordSdk.channelId,
          guildId: discordSdk.guildId,
        });

        log('認可コードを取得中...');
        const { code } = await discordSdk.commands.authorize({
          client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify', 'guilds', 'guilds.members.read', 'rpc.voice.read'],
        });

        log('トークン交換中...');
        const tokenResponse = await fetch('/api/discord/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const { access_token } = await tokenResponse.json();
        log('SDK を認証中...');
        const auth = await discordSdk.commands.authenticate({ access_token });
        log('認証成功:', auth.user.username);

        const discordUser: DiscordUser = {
          id: auth.user.id,
          username: auth.user.username,
          discriminator: auth.user.discriminator,
          avatar: auth.user.avatar,
          global_name: auth.user.global_name,
        };
        setUser(discordUser);

        // チャンネル情報を取得してストアを更新する関数
        const fetchChannelData = async () => {
          if (!discordSdk?.channelId) return;
          try {
            const channel = await discordSdk.commands.getChannel({
              channel_id: discordSdk.channelId
            });
            log('同期ログ: チャンネル情報を取得しました', { statesCount: channel.voice_states?.length });
            setRawChannelData(channel);

            if (channel.voice_states) {
              setVoiceStates(channel.voice_states);
            }
          } catch (e: any) {
            log('同期エラー: チャンネル情報の取得に失敗', e.message);
          }
        };

        if (discordSdk.channelId) {
          await fetchChannelData();

          // リアルタイム更新の購読
          handleVoiceStateUpdate = (event: any) => {
            console.log('[DiscordProvider] VOICE_STATE_UPDATE Event:', event);
            
            // 自分の管理しているチャンネル内の更新かチェック
            if (event.channel_id === discordSdk.channelId) {
              updateVoiceState(event);
            } else {
              // チャンネルIDが異なる（＝退室した）場合はリストから削除
              removeVoiceState(event.user.id);
            }
            
            // 念のため、短時間後に全体リフレッシュ（デバウンス的な役割）
            setTimeout(fetchChannelData, 500);
          };

          discordSdk.subscribe('VOICE_STATE_UPDATE', handleVoiceStateUpdate, { 
            channel_id: discordSdk.channelId 
          });

          // 定期的なポーリング (30秒おき)
          pollInterval = setInterval(fetchChannelData, 30000);
        }

        setReady(true);
        setIsConnected(true);

        return () => {
          if (pollInterval) clearInterval(pollInterval);
          if (discordSdk && discordSdk.channelId && handleVoiceStateUpdate) {
            discordSdk.unsubscribe('VOICE_STATE_UPDATE', handleVoiceStateUpdate, { 
              channel_id: discordSdk.channelId 
            });
          }
        };
      } catch (e: any) {
        console.error('[DiscordProvider] Error:', e);
        setError(e.message || 'Discordへの接続に失敗しました。');
      }
    }

    setupDiscord();
  }, [setUser, setReady, setInfo, setVoiceStates, updateVoiceState, removeVoiceState]);

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
          <div
            className="fixed top-16 left-4 w-96 max-h-[80vh] min-h-[300px] min-w-[300px] bg-slate-950/90 text-white p-4 rounded-lg shadow-2xl border border-white/20 z-[10000] text-[10px] font-mono backdrop-blur-md animate-in fade-in slide-in-from-top-2 overflow-auto"
            style={{ resize: 'both' }}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3 sticky top-0 bg-slate-950/20 backdrop-blur-sm z-10">
              <h3 className="text-xs font-bold text-cyan-400">ZUSTAND STORE DEBUG</h3>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[9px] uppercase tracking-wider">{isReady ? 'READY' : 'WAITING'}</span>
              </div>
            </div>

            <section className="space-y-4">
              <div>
                <h4 className="text-white/40 mb-1 uppercase tracking-tighter">Context:</h4>
                <div className="grid grid-cols-2 gap-1 text-[9px] pl-2 border-l border-white/10">
                  <span className="text-white/60">InstanceId:</span> <span className="text-white truncate">{instanceId || 'null'}</span>
                  <span className="text-white/60">ChannelId:</span> <span className="text-white truncate">{channelId || 'null'}</span>
                  <span className="text-white/60">GuildId:</span> <span className="text-white truncate">{guildId || 'null'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-white/40 mb-1 uppercase tracking-tighter flex justify-between">
                  <span>Voice States:</span>
                  <span className="text-emerald-500">{voiceStates.length} users</span>
                </h4>
                <div className="space-y-1">
                  {voiceStates.map((vs) => (
                    <div key={vs.user.id} className="p-1 px-2 bg-slate-900/30 rounded border border-slate-800/50 flex justify-between items-center">
                      <span className="truncate max-w-[120px]">{vs.user.global_name || vs.user.username}</span>
                      <span className="flex gap-2">
                        {vs.voice_state?.self_mute && <span title="Muted">🔇</span>}
                        {vs.voice_state?.self_deaf && <span title="Deafened">🎧</span>}
                      </span>
                    </div>
                  ))}
                  {voiceStates.length === 0 && <div className="text-slate-600 italic">No participants list.</div>}
                </div>
              </div>

              <div>
                <h4 className="text-white/40 mb-1 uppercase tracking-tighter text-cyan-500">Live Logs (Last 5):</h4>
                <div className="bg-black/50 p-2 rounded max-h-32 overflow-y-auto text-[9px] space-y-1">
                  {logMessages.slice(0, 5).map((m, i) => (
                    <div key={i} className="border-b border-white/5 pb-1 last:border-0">{m}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white/40 mb-1 uppercase tracking-tighter text-yellow-500">Raw Channel Data:</h4>
                <pre className="bg-black/50 p-2 rounded max-h-40 overflow-y-auto whitespace-pre-wrap break-all text-[8px] text-yellow-200/80">
                  {rawChannelData ? JSON.stringify(rawChannelData, null, 2) : 'No data fetched yet.'}
                </pre>
              </div>
            </section>

            <button
              onClick={() => setShowDebug(false)}
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded transition-colors text-[9px] uppercase tracking-widest border border-white/10"
            >
              Hide Debug
            </button>
          </div>
        )}
      </div>
    </>
  );
}
