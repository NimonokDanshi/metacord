/**
 * Supabase PostgreSQL のテーブル型定義
 * ※ Supabase CLI の `supabase gen types typescript` で自動生成したものと
 *    置き換え可能なように同じ構造で定義しています。
 */
export type Database = {
  public: {
    Tables: {
      /**
       * Discordサーバー情報を管理するマスタテーブル
       */
      m_servers: {
        Row: {
          server_id: string;
          name: string;
          layout_id: string;
          metadata: Record<string, unknown>;
          last_activity_at: string;
          created_at: string;
        };
        Insert: {
          server_id: string;
          name: string;
          layout_id?: string;
          metadata?: Record<string, unknown>;
          last_activity_at?: string;
          created_at?: string;
        };
        Update: {
          server_id?: string;
          name?: string;
          layout_id?: string;
          metadata?: Record<string, unknown>;
          last_activity_at?: string;
          created_at?: string;
        };
      };

      /**
       * 全ユーザーのプロフィールを管理するマスタテーブル
       * マイデスク設定(PC・小物等)は metadata に格納
       */
      m_users: {
        Row: {
          user_id: string;
          display_name: string;
          discord_avatar_url: string | null;
          avatar_id: string;
          metadata: Record<string, unknown>;
          last_seen_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          discord_avatar_url?: string | null;
          avatar_id?: string;
          metadata?: Record<string, unknown>;
          last_seen_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          discord_avatar_url?: string | null;
          avatar_id?: string;
          metadata?: Record<string, unknown>;
          last_seen_at?: string;
        };
      };

      /**
       * サーバー管理者が配置した共有家具のトランザクションテーブル
       */
      t_server_furniture: {
        Row: {
          id: string;
          server_id: string;
          item_id: string;
          pos_x: number;
          pos_z: number;
          rotation: number;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          server_id: string;
          item_id: string;
          pos_x: number;
          pos_z: number;
          rotation?: number;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          server_id?: string;
          item_id?: string;
          pos_x?: number;
          pos_z?: number;
          rotation?: number;
          metadata?: Record<string, unknown>;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// 各テーブルの Row 型のエイリアス（使いやすいように）
export type ServerRow = Database['public']['Tables']['m_servers']['Row'];
export type UserRow = Database['public']['Tables']['m_users']['Row'];
export type ServerFurnitureRow = Database['public']['Tables']['t_server_furniture']['Row'];
