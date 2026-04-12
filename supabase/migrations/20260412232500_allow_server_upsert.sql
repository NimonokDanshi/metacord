-- m_servers への UPSERT 許可 (新規サーバー接続時の自動登録用)
-- 概要：ルーム接続時にサーバー情報が存在しない場合、自動的にレコードを作成できるようにします。

DROP POLICY IF EXISTS "Allow anon to upsert servers" ON public.m_servers;

CREATE POLICY "Allow anon to upsert servers" ON public.m_servers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- コメント：これにより、roomDispatcher.ts での upsertServer 処理が RLS によってブロックされるのを防ぎます。
