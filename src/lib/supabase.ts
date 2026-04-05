import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * アプリ全体で使い回すSupabaseクライアント（シングルトン）。
 *
 * Discord Activity 内では DiscordProvider が patchUrlMappings() を呼ぶことで
 * window.fetch / window.WebSocket がモンキーパッチされ、
 * Supabase の通信が自動的に Discord プロキシ経由に変わる。
 * そのためクライアントの再初期化は不要。
 *
 * 環境変数が未設定の場合は null を返す（モジュールレベルでのクラッシュを防ぐ）。
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;
