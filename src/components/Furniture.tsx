import { useMemo } from 'react';
import { Texture, Rectangle } from 'pixi.js';
import { useApplication } from '@pixi/react';
import { gridToScreen } from '@/lib/isometric';
import {
  ISO_TILE_W,
  ISO_TILE_H,
  ORIGIN_Y,
  Z_INDEX_FURNITURE,
  VOXEL_ATLAS_URL,
  FRAME_DESK,
  FRAME_PLANT,
} from '@/constants/layout';

/**
 * 家具単体のプロパティ
 */
interface FurnitureProps {
  col: number;
  row: number;
  type: 'desk' | 'chair' | 'plant';
}

/**
 * 家具単体の描画
 */
function FurnitureItem({ col, row, type }: FurnitureProps) {
  const { app } = useApplication();
  const offsetX = app.screen.width / 2;
  const offsetY = ORIGIN_Y;

  const { x, y } = useMemo(() => gridToScreen(col, row, ISO_TILE_W, ISO_TILE_H, offsetX, offsetY), [col, row, offsetX, offsetY]);

  // アトラスからテクスチャを切り出し
  const texture = useMemo(() => {
    const base = Texture.from(VOXEL_ATLAS_URL);
    if (!base.source) return null;
    const frame = type === 'desk' ? FRAME_DESK : FRAME_PLANT;
    return new Texture({
      source: base.source,
      frame: new Rectangle(frame.x, frame.y, frame.width, frame.height),
    });
  }, [type]);

  if (!texture) return null;

  return (
    <pixiContainer x={x} y={y} zIndex={Z_INDEX_FURNITURE + y}>
      <pixiSprite
        texture={texture}
        anchor={{ x: 0.5, y: 0.95 }}
        scale={0.5}
      />
    </pixiContainer>
  );
}

const OFFICE_LAYOUT: FurnitureProps[] = [
  // デスククラスター 1
  { col: 2, row: 2, type: 'desk' },
  { col: 3, row: 2, type: 'desk' },
  { col: 4, row: 2, type: 'desk' },
  // デスククラスター 2
  { col: 7, row: 2, type: 'desk' },
  { col: 8, row: 2, type: 'desk' },
  // 観葉植物
  { col: 1, row: 1, type: 'plant' },
  { col: 10, row: 10, type: 'plant' },
];

export default function Furniture() {
  return (
    <>
      {OFFICE_LAYOUT.map((item, idx) => (
        <FurnitureItem key={idx} {...item} />
      ))}
    </>
  );
}
