// =============================================
// ピクセル・グリッド描画の定数
// =============================================

/** 2D グリッドでのタイル1枚の幅 (px) */
export const TILE_W = 64;

/** 2D グリッドでのタイル1枚の高さ (px) */
export const TILE_H = 64;

/** アイソメトリック投影時のタイルの見かけ上の幅 (px) */
export const ISO_TILE_W = 64;

/** アイソメトリック投影時のタイルの見かけ上の高さ (px) / 2:1 プロジェクション */
export const ISO_TILE_H = 32;

/** 部屋の横タイル数 */
export const GRID_COLS = 12;

/** 部屋の縦タイル数 */
export const GRID_ROWS = 12;

/** 座標系の中央補正 (原点) */
export const ORIGIN_X = 0;
export const ORIGIN_Y = 64;

/** 部屋全体の幅（px） */
export const ROOM_WIDTH = TILE_W * GRID_COLS;

/** 部屋全体の高さ（px） */
export const ROOM_HEIGHT = TILE_H * GRID_ROWS;

// =============================================
// カラーパレット（カイロソフト風ダークトーン）
// =============================================

/** 背景色 */
export const COLOR_BG = 0x1a1a2e;

/** フロアタイルの色（偶数） */
export const COLOR_FLOOR_A = 0x2a3a5c;

/** フロアタイルの色（奇数・チェッカー） */
export const COLOR_FLOOR_B = 0x253455;

/** グリッドラインの色 */
export const COLOR_GRID = 0x3a5080;

/** 壁の色 */
export const COLOR_WALL = 0x1e2a42;

// =============================================
// Z-Index 管理 (PixiJS 6+ 用)
// =============================================

export const Z_INDEX_FLOOR = 0;
export const Z_INDEX_SHADOW = 10;
export const Z_INDEX_FURNITURE = 100;
export const Z_INDEX_AVATARS = 500;
export const Z_INDEX_AUTOSITTING_CHAIR = 80; // キャラの真下
export const Z_INDEX_UI = 1000;

// =============================================
// Voxel Atlas 座標設定 (1024x1024 / 4x4 grid, 256px per cell)
// =============================================

export const VOXEL_ATLAS_URL = '/assets/voxel_atlas.png';

/** スプライトの切り出し範囲タイプ */
export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

// グリッド線(黒)を避けるためのオフセット
const PAD = 2;
const CELL = 256;

/** 床タイル (Row 0, Col 0) */
export const FRAME_TILE: SpriteFrame = { x: 0 + PAD, y: 0 + PAD, width: CELL - PAD*2, height: CELL - PAD*2 };

/** デスク (Row 0, Col 1) */
export const FRAME_DESK: SpriteFrame = { x: CELL * 1 + PAD, y: 0 + PAD, width: CELL - PAD*2, height: CELL - PAD*2 };

/** 椅子 (Row 0, Col 2) */
export const FRAME_CHAIR: SpriteFrame = { x: CELL * 2 + PAD, y: 0 + PAD, width: CELL - PAD*2, height: CELL - PAD*2 };

/** 観葉植物 (Row 1, Col 0) */
export const FRAME_PLANT: SpriteFrame = { x: 0 + PAD, y: CELL * 1 + PAD, width: CELL - PAD*2, height: CELL - PAD*2 };

/** 人型ボクセル (Row 1, Col 1 - Standing) */
export const FRAME_HUMAN_STAND: SpriteFrame = { x: CELL * 1 + PAD, y: CELL * 1 + PAD, width: CELL - PAD*2, height: CELL - PAD*2 };
