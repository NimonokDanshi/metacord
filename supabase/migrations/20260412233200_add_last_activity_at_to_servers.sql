-- m_servers テーブルに最終アクティビティ日時を記録するカラムを追加
-- 概要：サーバーの生存確認や整理のために必要なカラムを追加します。

ALTER TABLE public.m_servers 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- コメント：このカラムがないと、roomDispatcher.ts での UPSERT 処理が失敗し、
-- その結果としての外部キー制約違反（家具保存失敗）が発生します。
