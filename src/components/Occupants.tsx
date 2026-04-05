import { useMemo } from 'react';
import { Texture, Rectangle, TextStyle, Graphics as PixiGraphics } from 'pixi.js';
import { useApplication } from '@pixi/react';
import { useRoomStore } from '@/store/roomStore';
import { useDiscordStore } from '@/store/discordStore';
import { gridToScreen } from '@/lib/isometric';
import { getDiscordAvatarUrl } from '@/types/discord';
import {
  ISO_TILE_W,
  ISO_TILE_H,
  GRID_COLS,
  ORIGIN_Y,
  Z_INDEX_AVATARS,
  VOXEL_ATLAS_URL,
  FRAME_CHAIR,
  FRAME_HUMAN_STAND,
  Z_INDEX_AUTOSITTING_CHAIR,
} from '@/constants/layout';

function OccupantAvatar({ occupant, avatarUrl, offsetX, offsetY }: { 
  occupant: any, 
  avatarUrl?: string,
  offsetX: number,
  offsetY: number
}) {
  const col = occupant.seat_index % GRID_COLS;
  const row = Math.floor(occupant.seat_index / GRID_COLS);
  const { x, y } = useMemo(() => gridToScreen(col, row, ISO_TILE_W, ISO_TILE_H, offsetX, offsetY), [col, row, offsetX, offsetY]);

  // ボクセルアトラスからテクスチャを切り出し
  const chairTexture = useMemo(() => {
    const base = Texture.from(VOXEL_ATLAS_URL);
    return new Texture({
      source: base.source,
      frame: new Rectangle(FRAME_CHAIR.x, FRAME_CHAIR.y, FRAME_CHAIR.width, FRAME_CHAIR.height),
    });
  }, []);

  const humanTexture = useMemo(() => {
    const base = Texture.from(VOXEL_ATLAS_URL);
    return new Texture({
      source: base.source,
      frame: new Rectangle(FRAME_HUMAN_STAND.x, FRAME_HUMAN_STAND.y, FRAME_HUMAN_STAND.width, FRAME_HUMAN_STAND.height),
    });
  }, []);

  // アバターテクスチャ
  const avatarTexture = useMemo(() => {
    if (!avatarUrl) return null;
    return Texture.from(avatarUrl);
  }, [avatarUrl]);

  return (
    <pixiContainer x={x} y={y} zIndex={Z_INDEX_AVATARS + y}>
      {/* 椅子 */}
      <pixiSprite
        texture={chairTexture}
        anchor={{ x: 0.5, y: 0.9 }}
        scale={0.45}
        zIndex={Z_INDEX_AUTOSITTING_CHAIR}
      />
      
      {/* ボクセル人型キャラ */}
      <pixiSprite
        texture={humanTexture}
        anchor={{ x: 0.5, y: 1.0 }}
        scale={0.45}
        y={-5}
      />

      {/* Discord アイコンを頭上に表示 (Identity) */}
      {avatarUrl && avatarTexture && (
        <pixiContainer y={-60}>
            <pixiSprite
                texture={avatarTexture}
                anchor={0.5}
                width={20}
                height={20}
                mask={new PixiGraphics().circle(0, 0, 10).fill(0xffffff)}
            />
            <pixiGraphics
              draw={(g: PixiGraphics) => {
                g.clear().circle(0, 0, 11).stroke({ color: 0xffffff, width: 2 });
              }}
            />
        </pixiContainer>
      )}

      {/* ユーザー名 */}
      <pixiText
        text={occupant.display_name}
        anchor={0.5}
        y={15}
        style={new TextStyle({
          fontSize: 11,
          fill: 0xffffff,
          fontWeight: 'bold',
          stroke: { color: 0x000000, width: 3 }
        })}
      />
    </pixiContainer>
  );
}

export default function Occupants() {
  const { app } = useApplication();
  const { user: myUser } = useDiscordStore();
  const { occupants } = useRoomStore();

  const offsetX = app.screen.width / 2;
  const offsetY = ORIGIN_Y;

  return (
    <>
      {Array.from(occupants.values()).map((occupant) => (
        <OccupantAvatar
          key={occupant.user_id}
          occupant={occupant}
          avatarUrl={occupant.user_id === myUser?.id && myUser ? getDiscordAvatarUrl(myUser) : undefined}
          offsetX={offsetX}
          offsetY={offsetY}
        />
      ))}
    </>
  );
}
