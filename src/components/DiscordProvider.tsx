'use client';

import { useEffect, useState } from 'react';
import { discordSdk, setupDiscordProxy } from '@/lib/discord';
import { useDiscordStore } from '@/store/discordStore';
import { DiscordUser, DiscordChannel, VoiceState, getDiscordAvatarUrl } from '@/types/discord';
import { supabase } from '@/lib/supabase';
import { AvatarType } from '@/types/room';

import DebugOverlay from './DebugOverlay';

export default function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    user, instanceId, channelId, guildId, voiceStates, isReady,
    rawChannelData, logMessages, avatarType,
    setUser, setReady, setInfo, setVoiceStates, updateVoiceState, removeVoiceState,
    setRawChannelData, addLogMessage, setAvatarType
  } = useDiscordStore();

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

        // Supabase のプロフィール同期
        if (supabase) {
          log('Supabase プロフィール同期中...');
          const { data: upsertedUser, error: upsertError } = await (supabase.from('m_users') as any)
            .upsert({
              user_id: discordUser.id,
              display_name: discordUser.global_name || discordUser.username,
              discord_avatar_url: getDiscordAvatarUrl(discordUser),
              // 新規ユーザーの場合は初期値を penguin にしてみる（お好みで）
              last_seen_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
            .select()
            .single();

          if (upsertError) {
            log('Supabase 同期エラー:', upsertError.message);
          } else if (upsertedUser) {
            log('Supabase 同期成功:', (upsertedUser as any).avatar_id);
            if ((upsertedUser as any).avatar_id) {
              setAvatarType((upsertedUser as any).avatar_id as AvatarType);
            }
          }
        }

        // チャンネル情報を取得してストアを更新する関数
        const fetchChannelData = async () => {
          if (!discordSdk?.channelId) return;
          try {
            const channel = await discordSdk.commands.getChannel({
              channel_id: discordSdk.channelId
            });
            log('同期ログ: チャンネル情報を取得しました', { statesCount: (channel as DiscordChannel).voice_states?.length });
            setRawChannelData(channel);

            if ((channel as DiscordChannel).voice_states) {
              setVoiceStates((channel as DiscordChannel).voice_states);
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
            if (event.channel_id === discordSdk?.channelId) {
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
  }, [setUser, setReady, setInfo, setVoiceStates, updateVoiceState, removeVoiceState, setAvatarType, setRawChannelData]);

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
      <DebugOverlay />
    </>
  );
}
