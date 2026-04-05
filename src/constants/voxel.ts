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
  WALL: '#1a1a2e',
  DESK: '#7f8c8d',
  CHAIR: '#d35400', // オレンジ
  PLANT: '#27ae60',
  POT: '#a0522d',
  AVATAR_BLUE: '#3498db',
  AVATAR_SKIN: '#f3e5ab',
};

// Z-Index (3D では主に Y 軸方向の重なりとして処理)
export const HEIGHT_FLOOR = 0;
export const HEIGHT_PLATFORM = 0.05;
export const HEIGHT_FURNITURE = 0.5;
export const HEIGHT_MEMBER = 0.8;
