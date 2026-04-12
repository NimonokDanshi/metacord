-- カラム名の変更：pos_y -> pos_z, z_index -> rotation
-- 概要：初期のスキーマ定義を現在の 3D 空間設計に合わせるための修正

ALTER TABLE public.t_server_furniture 
RENAME COLUMN pos_y TO pos_z;

ALTER TABLE public.t_server_furniture 
RENAME COLUMN z_index TO rotation;

-- rotation の型を整数から浮動小数点に変更（角度の細かい計算に対応するため）
ALTER TABLE public.t_server_furniture 
ALTER COLUMN rotation TYPE float8;

-- コメント：このマイグレーションを適用することで、プログラムからの INSERT / UPDATE 時の 400 Bad Request が解消されます。
