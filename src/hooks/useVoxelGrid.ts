import { useMemo } from 'react';
import { GRID_SIZE_X, VOXEL_SIZE, GRID_SIZE_Z } from '@/constants/voxel';

export interface VoxelPosition {
  x: number;
  y: number;
  z: number;
}

export function useVoxelGrid() {
  /**
   * 3D 空間の座標をグリッド座標 [x, z] に変換します。
   */
  const getGridFromWorld = useMemo(() => (worldX: number, worldZ: number): [number, number] => {
    const offsetX = (GRID_SIZE_X * VOXEL_SIZE) / 2 - VOXEL_SIZE / 2;
    const offsetZ = (GRID_SIZE_Z * VOXEL_SIZE) / 2 - VOXEL_SIZE / 2;

    const col = Math.round((worldX + offsetX) / VOXEL_SIZE);
    const row = Math.round((worldZ + offsetZ) / VOXEL_SIZE);

    return [
      Math.max(0, Math.min(GRID_SIZE_X - 1, col)),
      Math.max(0, Math.min(GRID_SIZE_Z - 1, row))
    ];
  }, []);

  /**
   * グリッド座標 [x, z] を 3D 空間の座標に変換します。
   */
  const getWorldFromGrid = useMemo(() => (gridX: number, gridZ: number, height = 0): VoxelPosition => {
    const offsetX = (GRID_SIZE_X * VOXEL_SIZE) / 2 - VOXEL_SIZE / 2;
    const offsetZ = (GRID_SIZE_Z * VOXEL_SIZE) / 2 - VOXEL_SIZE / 2;

    return {
      x: gridX * VOXEL_SIZE - offsetX,
      y: height,
      z: gridZ * VOXEL_SIZE - offsetZ,
    };
  }, []);

  /**
   * SeatIndex (0-143) を 3D 座標 (x, y, z) に変換します。
   */
  const getPositionFromSeat = useMemo(() => (seatIndex: number, height = 0): VoxelPosition => {
    const col = seatIndex % GRID_SIZE_X;
    const row = Math.floor(seatIndex / GRID_SIZE_X);
    return getWorldFromGrid(col, row, height);
  }, [getWorldFromGrid]);

  /**
   * 指定されたグリッド範囲が配置可能かどうかを判定します。
   */
  const checkCollision = useMemo(() => (
    gridX: number, 
    gridZ: number, 
    sizeX: number, 
    sizeZ: number,
    occupiedGrids: Set<string> // "x,z" 形式の文字列セットを想定
  ): boolean => {
    // 境界チェック
    if (gridX < 0 || gridZ < 0 || gridX + sizeX > GRID_SIZE_X || gridZ + sizeZ > GRID_SIZE_Z) {
      return false;
    }

    // 重複チェック
    for (let x = gridX; x < gridX + sizeX; x++) {
      for (let z = gridZ; z < gridZ + sizeZ; z++) {
        if (occupiedGrids.has(`${x},${z}`)) {
          return false;
        }
      }
    }

    return true;
  }, []);

  return { 
    getPositionFromSeat, 
    getGridFromWorld, 
    getWorldFromGrid,
    checkCollision 
  };
}
