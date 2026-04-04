// =============================================
// ピクセル・グリッド描画の定数
// =============================================

/** タイル1枚の幅（px） */
export const TILE_W = 64;

/** タイル1枚の高さ（px） */
export const TILE_H = 64;

/** 部屋の横タイル数 */
export const GRID_COLS = 10;

/** 部屋の縦タイル数 */
export const GRID_ROWS = 8;

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
