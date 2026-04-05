import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Discord Activity 用のプロキシパス設定
// ブラウザ環境かつ localhost 以外の場合は、外部 URL ではなくパスを指定することで
// Discord SDK の patchUrlMappings が通信をインターセプトできるようにします。
const isBrowser = typeof window !== 'undefined';
const isLocal = isBrowser && window.location.hostname === 'localhost';

const finalUrl = (isBrowser && !isLocal) 
  ? '/supabase-rt' 
  : supabaseUrl;

/**
 * アプリ全体で使い回すSupabaseクライアント（シングルトン）。
 */
export const supabase =
  finalUrl && supabaseAnonKey
    ? createClient<Database>(finalUrl, supabaseAnonKey)
    : null;
