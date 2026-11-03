import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { PresencePayload } from '@/types/room';

export type PresenceCallback = (state: Record<string, PresencePayload[]>) => void;
export type PresenceEventCallback = (payloads: PresencePayload[]) => void;

export interface VoiceVolumePayload {
  userId: string;
  volume: number;
}

export interface EmotePayload {
  userId: string;
  emote: string;
  timestamp: number;
}

export interface UserLifecyclePayload {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface PresenceHandlers {
  onSync: PresenceCallback;
  onJoin: PresenceEventCallback;
  onLeave: PresenceEventCallback;
  onVoiceVolume?: (payload: VoiceVolumePayload) => void;
  onEmote?: (payload: EmotePayload) => void;
  onUserInstantLeave?: (payload: UserLifecyclePayload) => void;
  onUserInstantJoin?: (payload: UserLifecyclePayload) => void;
}

/**
 * Supabase Presence & Broadcast の通信を統合管理するサービス
 */
export class PresenceService {
  private channel: RealtimeChannel | null = null;

  constructor(
    private supabase: SupabaseClient,
    private roomKey: string,
    private userId: string
  ) {}

  /**
   * チャンネルに接続し、PresenceおよびBroadcastハンドラを登録する
   */
  public subscribe(handlers: PresenceHandlers): Promise<string> {
    this.channel = this.supabase.channel(this.roomKey, {
      config: { 
        presence: { key: this.userId },
        broadcast: { self: false } // 自分の送信したブロードキャストは自身で受信しない
      },
    });

    // --- Presence イベント ---
    this.channel
      .on('presence', { event: 'sync' }, () => {
        if (this.channel) {
          const state = this.channel.presenceState<PresencePayload>();
          handlers.onSync(state);
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        handlers.onJoin(newPresences as unknown as PresencePayload[]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        handlers.onLeave(leftPresences as unknown as PresencePayload[]);
      });

    // --- Broadcast: 音量リアルタイム同期 ---
    this.channel.on('broadcast', { event: 'voice_volume' }, ({ payload }) => {
      handlers.onVoiceVolume?.(payload as VoiceVolumePayload);
    });

    // --- Broadcast: エモート同期 ---
    this.channel.on('broadcast', { event: 'avatar_emote' }, ({ payload }) => {
      handlers.onEmote?.(payload as EmotePayload);
    });

    // --- Broadcast: 即時入退室通知 ---
    this.channel.on('broadcast', { event: 'user_instant_leave' }, ({ payload }) => {
      handlers.onUserInstantLeave?.(payload as UserLifecyclePayload);
    });

    this.channel.on('broadcast', { event: 'user_instant_join' }, ({ payload }) => {
      handlers.onUserInstantJoin?.(payload as UserLifecyclePayload);
    });

    return new Promise((resolve) => {
      this.channel!.subscribe((status) => {
        resolve(status);
      });
    });
  }

  /**
   * 自分のマイク音量を低遅延ブロードキャストする
   */
  public async broadcastVoiceVolume(volume: number): Promise<void> {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'voice_volume',
      payload: { userId: this.userId, volume } as VoiceVolumePayload,
    }).catch(() => {});
  }

  /**
   * エモート（リアクション）をブロードキャストする
   */
  public async broadcastEmote(emote: string): Promise<void> {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'avatar_emote',
      payload: { userId: this.userId, emote, timestamp: Date.now() } as EmotePayload,
    }).catch(() => {});
  }

  /**
   * 即時入室をブロードキャストする
   */
  public async broadcastInstantJoin(displayName: string, avatarUrl?: string): Promise<void> {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'user_instant_join',
      payload: { userId: this.userId, displayName, avatarUrl } as UserLifecyclePayload,
    }).catch(() => {});
  }

  /**
   * 即時退室をブロードキャストする
   */
  public async broadcastInstantLeave(): Promise<void> {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'user_instant_leave',
      payload: { userId: this.userId } as UserLifecyclePayload,
    }).catch(() => {});
  }

  /**
   * 自分の状態を放送する (Presence)
   */
  public async track(payload: PresencePayload): Promise<string> {
    if (!this.channel) return 'error';
    return await this.channel.track(payload).catch((e) => {
      console.error('[PresenceService] track error:', e);
      return 'error';
    });
  }

  /**
   * 接続を解除する
   */
  public unsubscribe() {
    if (this.channel) {
      // 退出通知を送信してから切断
      this.broadcastInstantLeave();
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  /**
   * チャンネルオブジェクトを直接取得する (特殊な用途用)
   */
  public getChannel() {
    return this.channel;
  }
}
