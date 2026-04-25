/**
 * Voxel World Constants
 * 全ての単位は 3D 空間上の 1.0 (1メートル相当) を基準にします。
 */

export const VOXEL_SIZE = 1.0;

// グリッド設定
export const GRID_SIZE_X = 12;
export const GRID_SIZE_Z = 12;

// カラーパレット (Unrailed! 風の少し鮮やかでマットなトーン)
export const COLORS = {
  FLOOR_DARK: '#2c3e50',
  FLOOR_LIGHT: '#34495e',
  DESK: '#7f8c8d',
  CHAIR: '#d35400', // オレンジ
  PLANT: '#27ae60',
  POT: '#a0522d',
  AVATAR_BLUE: '#3498db',
  AVATAR_SKIN: '#f3e5ab',
  PENGUIN_BLACK: '#2f3640',
  PENGUIN_WHITE: '#f5f6fa',
  PENGUIN_YELLOW: '#fbc531',
  MONITOR: '#2d3436',
  PC_CASE: '#636e72',
  WALL: '#f5f6fa',
  FLOOR: '#000000',
  GLASS: '#81ecec',
  KEYBOARD: '#f5f6fa',
  MOUSE: '#2d3436',
  CAT_GREY: '#95a5a6',
  CAT_PINK: '#ffafcc',
  JAPANDI_WOOD: '#dcb993',    // 明るいオーク材
  JAPANDI_BEIGE: '#f5f5dc',   // ベージュ（座面など）
  JAPANDI_OFFWHITE: '#faf9f6', // オフホワイト
  JAPANDI_LEG: '#4a4a4a',      // 細身の脚用のダークグレー
};

// Z-Index (3D では主に Y 軸方向の重なりとして処理)
export const HEIGHT_FLOOR = 0;
export const HEIGHT_PLATFORM = 0.05;
export const HEIGHT_DESK = 0.75; // デスクを少し高く
export const HEIGHT_CHAIR_SEAT = 0.45;
export const HEIGHT_MEMBER_STANDING = 0; // アバターの基準点（足元）
export const HEIGHT_MEMBER_SITTING = 0.45; // アバターの基準点（お尻）

// 家具サイズ
export const DESK_WIDTH = 1.95; // 2マス弱 (隙間用)
export const DESK_DEPTH = 0.8;
