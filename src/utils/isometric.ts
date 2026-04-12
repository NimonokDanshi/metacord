/**
 * 2D グリッド座標 (col, row) をアイソメトリック空間のスクリーン座標 (x, y) に変換するためのユーティリティ
 * 
 * 標準的な 2:1 アイソメトリック投影 (幅 64px なら高さ 32px) を想定。
 */

export interface IsoPoint {
  x: number;
  y: number;
}

/**
 * グリッド座標 (col, row) をスクリーン上のピクセル座標 (x, y) に変換する
 * @param col 列インデックス (0, 1, 2...)
 * @param row 行インデックス (0, 1, 2...)
 * @param tileW タイルの幅 (デフォルト 64)
 * @param tileH タイルの高さ (デフォルト 32)
 * @param centerOffset 画面中央へのオフセット
 */
export function gridToScreen(
  col: number,
  row: number,
  tileW: number = 64,
  tileH: number = 32,
  offsetX: number = 0,
  offsetY: number = 0
): IsoPoint {
  // アイソメトリック変換式 (2:1 投影)
  // 横方向: (col - row) * (tileW / 2)
  // 縦方向: (col + row) * (tileH / 2)
  const x = (col - row) * (tileW / 2) + offsetX;
  const y = (col + row) * (tileH / 2) + offsetY;
  
  return { x, y };
}

/**
 * 連続した値 (0.5, 1.2 など) もサポートするグリッド座標への変換
 * オブジェクトの中心点などを算出する際に便利
 */
export function gridToScreenDetailed(
  col: number,
  row: number,
  tileW: number = 64,
  tileH: number = 32,
  offsetX: number = 0,
  offsetY: number = 0
): IsoPoint {
  return gridToScreen(col, row, tileW, tileH, offsetX, offsetY);
}
