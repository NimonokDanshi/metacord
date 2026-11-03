import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { hasFrameId, setupDiscordProxy } from './discord';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isBrowser = typeof window !== 'undefined';
const isLocal = isBrowser && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'
);

// Discord Activity 内（iframe sandbox）の場合は、Discord の CSP（Content Security Policy）対策のため
// 直接外部 URL (https://*.supabase.co) に接続すると WebSocket がブロックされます。
// そのため、window.location.origin + '/supabase-rt' をベース URL として設定し、
// REST API と Realtime WebSocket の両方を Discord プロキシ経由で中継させます。
const isDiscordActivity = isBrowser && !isLocal && hasFrameId;

if (isDiscordActivity) {
  setupDiscordProxy();
}

const finalSupabaseUrl = isDiscordActivity
  ? `${window.location.origin}/supabase-rt`
  : rawSupabaseUrl;

export const supabase = (finalSupabaseUrl && supabaseAnonKey)
  ? createClient<Database>(finalSupabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 15,
        },
      },
    })
  : null;
