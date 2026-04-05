import { useMemo } from 'react';
import { GRID_SIZE_X, VOXEL_SIZE, GRID_SIZE_Z } from '@/constants/voxel';

export interface VoxelPosition {
  x: number;
  y: number;
  z: number;
}

export function useVoxelGrid() {
  /**
   * SeatIndex (0-143) を 3D 座標 (x, y, z) に変換します。
   * ルームの中心を (0, 0, 0) とするため、オフセットを加味します。
   */
  const getPositionFromSeat = useMemo(() => (seatIndex: number, height = 0): VoxelPosition => {
    const col = seatIndex % GRID_SIZE_X;
    const row = Math.floor(seatIndex / GRID_SIZE_X);

    // 中心寄せのオフセット
    const offsetX = (GRID_SIZE_X * VOXEL_SIZE) / 2 - VOXEL_SIZE / 2;
    const offsetZ = (GRID_SIZE_Z * VOXEL_SIZE) / 2 - VOXEL_SIZE / 2;

    return {
      x: col * VOXEL_SIZE - offsetX,
      y: height,
      z: row * VOXEL_SIZE - offsetZ,
    };
  }, []);

  return { getPositionFromSeat };
}
