-- 家具配置テーブルの作成
CREATE TABLE IF NOT EXISTS public.t_server_furniture (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    pos_x INTEGER NOT NULL,
    pos_z INTEGER NOT NULL,
    rotation FLOAT8 DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 家具所持テーブルの作成
CREATE TABLE IF NOT EXISTS public.t_user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMPTZ DEFAULT now()
);

-- RLS（セキュリティ）の設定（一旦、全員が読み書きできるようにします）
ALTER TABLE public.t_server_furniture ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for furniture" ON public.t_server_furniture;
CREATE POLICY "Enable all access for furniture" ON public.t_server_furniture FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.t_user_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for inventory" ON public.t_user_inventory;
CREATE POLICY "Enable all access for inventory" ON public.t_user_inventory FOR ALL USING (true) WITH CHECK (true);
