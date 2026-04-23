import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { hasFrameId } from './discord';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Discord Activity 用のプロキシパス設定
// ブラウザ環境かつ localhost 以外の場合は、外部 URL ではなくパスを指定することで
// Discord SDK の patchUrlMappings が通信をインターセプトできるようにします。
const isBrowser = typeof window !== 'undefined';
const isLocal = isBrowser && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'
);

/**
 * Discord Activity 用のカスタム fetch
 * REST API リクエストをプロキシ経由に書き換えます。
 * これにより、WebSocket (Realtime) の接続先 URL を壊さずに HTTP 通信だけをプロキシできます。
 * 
 * 注意: Discord の patchUrlMappings が有効な場合（hasFrameId が true の場合）のみ
 * 書き換えを行う必要があります。そうでないと通常のブラウザで 404/エラーになります。
 */
const customFetch = (url: string, options: any) => {
  if (isBrowser && !isLocal && hasFrameId && url.startsWith(supabaseUrl!)) {
    const proxiedUrl = url.replace(supabaseUrl!, `${window.location.origin}/supabase-rt`);
    console.log(`[customFetch] Proxying request: ${url} -> ${proxiedUrl}`);
    return fetch(proxiedUrl, options);
  }
  return fetch(url, options);
};

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: {
          fetch: customFetch as any,
        },
      })
    : null;
