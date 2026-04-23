/**
 * Supabase PostgreSQL のテーブル型定義
 * ※ Supabase CLI の形式に準拠
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          metadata: Json;
          last_activity_at: string;
          created_at: string;
        };
        Insert: {
          server_id: string;
          name: string;
          layout_id?: string;
          metadata?: Json;
          last_activity_at?: string;
          created_at?: string;
        };
        Update: {
          server_id?: string;
          name?: string;
          layout_id?: string;
          metadata?: Json;
          last_activity_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      /**
       * 全ユーザーのプロフィールを管理するマスタテーブル
       */
      m_users: {
        Row: {
          user_id: string;
          display_name: string;
          discord_avatar_url: string | null;
          avatar_id: string;
          metadata: Json;
          last_seen_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          discord_avatar_url?: string | null;
          avatar_id?: string;
          metadata?: Json;
          last_seen_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          discord_avatar_url?: string | null;
          avatar_id?: string;
          metadata?: Json;
          last_seen_at?: string;
        };
        Relationships: [];
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
          metadata: Json;
        };
        Insert: {
          id?: string;
          server_id: string;
          item_id: string;
          pos_x: number;
          pos_z: number;
          rotation?: number;
          metadata?: Json;
        };
        Update: {
          id?: string;
          server_id?: string;
          item_id?: string;
          pos_x?: number;
          pos_z?: number;
          rotation?: number;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "t_server_furniture_server_id_fkey";
            columns: ["server_id"];
            isOneToOne: false;
            referencedRelation: "m_servers";
            referencedColumns: ["server_id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// 各テーブルの Row 型のエイリアス
export type ServerRow = Database['public']['Tables']['m_servers']['Row'];
export type UserRow = Database['public']['Tables']['m_users']['Row'];
export type ServerFurnitureRow = Database['public']['Tables']['t_server_furniture']['Row'];
