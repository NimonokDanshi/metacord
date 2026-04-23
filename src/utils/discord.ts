import { DiscordSDK, patchUrlMappings } from '@discord/embedded-app-sdk';

const discordClientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// ブラウザ環境かつ、frame_id が URL パラメータに存在するかチェック
const isBrowser = typeof window !== 'undefined';
export const hasFrameId = isBrowser && new URLSearchParams(window.location.search).has('frame_id');

export const discordSdk = (isBrowser && hasFrameId)
    ? new DiscordSDK(discordClientId || 'mock-id')
    : null;

/**
 * Discord Activity のプロキシ設定（CSP対策）
 * window.fetch / WebSocket / XHR をモンキーパッチして URL を書き換える。
 */
export function setupDiscordProxy() {
  // https:// などを除去し、ホスト名のみを抽出（末尾のスラッシュも除去）
  const target = supabaseUrl.replace(/^https?:\/\//, '').split('/')[0];
  if (!target) return;

  patchUrlMappings([
    {
      prefix: '/supabase-rt',
      target: target,
    },
  ]);
}
