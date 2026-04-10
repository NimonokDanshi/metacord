/**
 * Discord SDK の authenticate() で返ってくるユーザー情報の型
 */
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string | null;
  global_name?: string | null;
  bot?: boolean;
  flags?: number | null;
  premium_type?: number | null;
}

/**
 * ボイスステート（マイク・スピーカーの状態）
 * Discord SDK の getChannel や VOICE_STATE_UPDATE の構造に準拠
 */
export interface VoiceState {
  mute: boolean;
  nick: string;
  user: DiscordUser;
  voice_state: {
    mute: boolean;
    deaf: boolean;
    self_mute: boolean;
    self_deaf: boolean;
    self_video?: boolean;
    self_stream?: boolean;
    suppress: boolean;
  };
  volume: number;
}

/**
 * チャンネル情報の型 (GET_CHANNEL)
 */
export interface DiscordChannel {
  id: string;
  name?: string | null;
  type: number;
  voice_states: VoiceState[];
}

/**
 * アバター画像のURLを生成するユーティリティ
 */
export function getDiscordAvatarUrl(user: DiscordUser, size: number = 128): string {
  if (!user) return `https://cdn.discordapp.com/embed/avatars/0.png`;
  
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  }

  try {
    // アバター未設定の場合はデフォルト画像
    // 公式推奨: (BigInt(user.id) >> 22n) % 6n
    // IDが数字ではない場合（モックIDなど）の計算失敗を防ぐ
    if (!/^\d+$/.test(user.id)) {
      return `https://cdn.discordapp.com/embed/avatars/0.png`;
    }
    const userIdBigInt = BigInt(user.id);
    const defaultAvatarIndex = Number((userIdBigInt >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
  } catch (e) {
    console.error('[getDiscordAvatarUrl] Calculate failed, using fallback:', e);
    // 失敗した場合は暫定的にインデックス 0 を使用
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
}
