/**
 * Discord SDK の authenticate() で返ってくるユーザー情報の型
 */
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

/**
 * アバター画像のURLを生成するユーティリティ
 */
export function getDiscordAvatarUrl(user: DiscordUser, size: number = 128): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  }
  // アバター未設定の場合はデフォルト画像
  // 公式推奨: (BigInt(user.id) >> 22n) % 6n
  const defaultAvatarIndex = (BigInt(user.id) >> 22n) % 6n;
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
}
