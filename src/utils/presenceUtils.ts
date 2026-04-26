import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { PresencePayload } from '@/types/room';

export type PresenceCallback = (state: Record<string, PresencePayload[]>) => void;
export type PresenceEventCallback = (payloads: PresencePayload[]) => void;

export interface PresenceHandlers {
  onSync: PresenceCallback;
  onJoin: PresenceEventCallback;
  onLeave: PresenceEventCallback;
}

/**
 * Supabase Presence の通信を管理するサービス
 */
export class PresenceService {
  private channel: RealtimeChannel | null = null;

  constructor(
    private supabase: SupabaseClient,
    private roomKey: string,
    private userId: string
  ) {}

  /**
   * チャンネルに接続し、ハンドラを登録する
   */
  public subscribe(handlers: PresenceHandlers): Promise<string> {
    this.channel = this.supabase.channel(this.roomKey, {
      config: { presence: { key: this.userId } },
    });

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

    return new Promise((resolve) => {
      this.channel!.subscribe((status) => {
        resolve(status);
      });
    });
  }

  /**
   * 自分の状態を放送する
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
