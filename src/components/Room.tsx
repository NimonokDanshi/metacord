'use client';

import { useMemo } from 'react';
import { useApplication } from '@pixi/react';
import { Texture, Rectangle } from 'pixi.js';
import { gridToScreen } from '@/lib/isometric';
import {
  ISO_TILE_W,
  ISO_TILE_H,
  GRID_COLS,
  GRID_ROWS,
  VOXEL_ATLAS_URL,
  FRAME_TILE,
  ORIGIN_Y,
} from '@/constants/layout';

export default function Room() {
  const { app } = useApplication();

  // ボクセルアトラスからタイルテクスチャを作成
  const tileTexture = useMemo(() => {
    const base = Texture.from(VOXEL_ATLAS_URL);
    if (!base.source) return null;
    return new Texture({
      source: base.source,
      frame: new Rectangle(FRAME_TILE.x, FRAME_TILE.y, FRAME_TILE.width, FRAME_TILE.height),
    });
  }, []);

  if (!tileTexture) return null;

  const offsetX = app.screen.width / 2;
  const offsetY = ORIGIN_Y;

  return (
    <>
      {Array.from({ length: GRID_ROWS }).map((_, row) =>
        Array.from({ length: GRID_COLS }).map((_, col) => {
          const { x, y } = gridToScreen(col, row, ISO_TILE_W, ISO_TILE_H, offsetX, offsetY);
          return (
            <pixiSprite
              key={`${col}-${row}`}
              texture={tileTexture}
              x={x}
              y={y}
              width={ISO_TILE_W + 2} // 隙間を埋めるための微調整
              height={ISO_TILE_W + 2} // アトラス内のタイル形状に合わせて調整
              anchor={0.5}
            />
          );
        })
      )}
    </>
  );
}
