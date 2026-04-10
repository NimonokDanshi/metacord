-- =============================================
-- Metacord (仮) - 初期テーブルセットアップ SQL (Migration)
-- =============================================

-- -----------------------------------------------
-- 1. m_servers: Discordサーバー管理テーブル
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.m_servers (
  server_id   TEXT PRIMARY KEY,               -- DiscordのサーバーID
  name        TEXT NOT NULL,                  -- サーバー名
  layout_id   TEXT NOT NULL DEFAULT 'default', -- 使用レイアウトID（フロントのmaster dataと対応）
  metadata    JSONB NOT NULL DEFAULT '{}',    -- 拡張用メタデータ
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.m_servers IS 'Discordサーバーとそのルーム設定を管理するマスタテーブル';

-- -----------------------------------------------
-- 2. m_users: ユーザープロフィールテーブル
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.m_users (
  user_id            TEXT PRIMARY KEY,                -- DiscordのユーザーID
  display_name       TEXT NOT NULL,                   -- 表示名
  discord_avatar_url TEXT,                            -- DiscordアバターURL
  avatar_id          TEXT NOT NULL DEFAULT 'default', -- 選択したアバターID
  metadata           JSONB NOT NULL DEFAULT '{}',     -- マイデスク設定等（PC種別・小物等）
  last_seen_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.m_users IS '全ユーザーのプロフィールとマイデスク設定を管理するマスタテーブル';

-- -----------------------------------------------
-- 3. t_server_furniture: 共有家具配置テーブル
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.t_server_furniture (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id   TEXT NOT NULL REFERENCES public.m_servers(server_id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL,    -- 家具ID（フロントのmaster dataと対応）
  pos_x       INTEGER NOT NULL,
  pos_y       INTEGER NOT NULL,
  z_index     INTEGER NOT NULL DEFAULT 0,
  metadata    JSONB NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE public.t_server_furniture IS 'サーバー管理者が配置した共有家具のレイアウトを記録するテーブル';

-- t_server_furniture のインデックス（サーバーIDでの絞り込みを高速化）
CREATE INDEX IF NOT EXISTS idx_server_furniture_server_id
  ON public.t_server_furniture(server_id);

-- -----------------------------------------------
-- RLS (Row Level Security) の有効化
-- -----------------------------------------------
ALTER TABLE public.m_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.m_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.t_server_furniture ENABLE ROW LEVEL SECURITY;

-- 読み取りは全員許可
DROP POLICY IF EXISTS "anon can read servers" ON public.m_servers;
CREATE POLICY "anon can read servers" ON public.m_servers FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon can read users" ON public.m_users;
CREATE POLICY "anon can read users" ON public.m_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon can read furniture" ON public.t_server_furniture;
CREATE POLICY "anon can read furniture" ON public.t_server_furniture FOR SELECT USING (true);

-- m_users への UPSERT 許可 (401エラー解消用)
DROP POLICY IF EXISTS "Allow anon to upsert users" ON public.m_users;
CREATE POLICY "Allow anon to upsert users" ON public.m_users
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
