/**
 * Issue #5: Supabase Realtime Presence の型定義
 *
 * 座席の確保状態はDBに保存せず、PresenceのWebSocket通信上でのみ管理する（エフェメラル）。
 * 接続が切れると自動的にPresenceからデータが削除され、着席状態が解放される。
 */

/**
 * Supabase Presenceチャンネルに送信する在室データ
 * 1ユーザー = 1エントリ
 */
export interface PresencePayload {
  /** DiscordのユーザーID */
  user_id: string;
  /** 表示名 */
  display_name: string;
  /** Discordアバターのアイコン (URL) */
  avatar_url: string | null;
  /** 着席しているシート番号 (0 〜 GRID_COLS * GRID_ROWS - 1) */
  seat_index: number;
  /** 入室日時 */
  joined_at: string;
}

/**
 * アプリ内で管理する着席情報（Presenceから変換済み）
 */
export type SeatOccupant = Omit<PresencePayload, 'joined_at'>;
