'use client';

import { useEffect, useRef } from 'react';
import { Graphics, Text, TextStyle } from 'pixi.js';
import { useApplication } from '@pixi/react';
import { useRoomStore } from '@/store/roomStore';
import { useDiscordStore } from '@/store/discordStore';
import { TILE_W, TILE_H, GRID_COLS, ROOM_WIDTH, ROOM_HEIGHT } from '@/constants/layout';

const AVATAR_RADIUS = 20;
const COLOR_SELF = 0x60a5fa;   // 自分：青
const COLOR_OTHER = 0xa3e635;  // 他者：緑

function seatIndexToXY(
  seatIndex: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  const col = seatIndex % GRID_COLS;
  const row = Math.floor(seatIndex / GRID_COLS);
  return {
    x: offsetX + col * TILE_W + TILE_W / 2,
    y: offsetY + row * TILE_H + TILE_H / 2,
  };
}

export default function Occupants() {
  const { app } = useApplication();
  const { user: myUser } = useDiscordStore();
  const { occupants } = useRoomStore();
  const graphicsRef = useRef<Graphics | null>(null);
  const labelsRef = useRef<Text[]>([]);

  useEffect(() => {
    // 前フレームの描画物を安全にクリア
    if (graphicsRef.current && !graphicsRef.current.destroyed) {
      app.stage.removeChild(graphicsRef.current);
      graphicsRef.current.destroy();
      graphicsRef.current = null;
    }
    labelsRef.current.forEach((t) => {
      if (!t.destroyed) {
        app.stage.removeChild(t);
        t.destroy();
      }
    });
    labelsRef.current = [];

    // 在室者がいない場合はスキップ
    if (occupants.size === 0) return;

    // app.screen でキャンバスの実際のサイズを取得して中央寄せ
    const offsetX = Math.max(0, (app.screen.width - ROOM_WIDTH) / 2);
    const offsetY = Math.max(0, (app.screen.height - ROOM_HEIGHT) / 2);

    const g = new Graphics();
    graphicsRef.current = g;
    // フロア(index:0)の上に重ねる
    app.stage.addChildAt(g, Math.min(1, app.stage.children.length));

    const texts: Text[] = [];

    for (const occupant of occupants.values()) {
      const { x, y } = seatIndexToXY(occupant.seat_index, offsetX, offsetY);
      const isSelf = occupant.user_id === myUser?.id;
      const color = isSelf ? COLOR_SELF : COLOR_OTHER;

      // アバター円（仮実装 → 将来スプライト化）
      g.circle(x, y, AVATAR_RADIUS).fill({ color, alpha: 0.85 });
      g.circle(x, y, AVATAR_RADIUS).stroke({ color: 0xffffff, width: 1.5, alpha: 0.5 });

      // ユーザー名ラベル
      const label = new Text({
        text: occupant.display_name,
        style: new TextStyle({
          fontSize: 10,
          fill: 0xffffff,
          align: 'center',
          fontFamily: 'sans-serif',
        }),
      });
      label.anchor.set(0.5, 0);
      label.x = x;
      label.y = y + AVATAR_RADIUS + 3;
      app.stage.addChild(label);
      texts.push(label);
    }

    labelsRef.current = texts;

    return () => {
      if (!g.destroyed) {
        app.stage.removeChild(g);
        g.destroy();
      }
      texts.forEach((t) => {
        if (!t.destroyed) {
          app.stage.removeChild(t);
          t.destroy();
        }
      });
      graphicsRef.current = null;
      labelsRef.current = [];
    };
  }, [app, occupants, myUser]);

  return null;
}
