'use client';

import { useEffect, useRef } from 'react';
import { Graphics, Text, TextStyle } from 'pixi.js';
import { useApplication } from '@pixi/react';
import { useRoomStore } from '@/store/roomStore';
import { useDiscordStore } from '@/store/discordStore';
import { TILE_W, TILE_H, GRID_COLS } from '@/constants/layout';

const AVATAR_RADIUS = 20;
const COLOR_SELF = 0x60a5fa;    // 自分：青
const COLOR_OTHER = 0xa3e635;   // 他者：緑

/**
 * seat_index から描画座標 (x, y) を計算する
 * seat_index = row * GRID_COLS + col の形式
 */
function seatIndexToXY(seatIndex: number): { x: number; y: number } {
  const col = seatIndex % GRID_COLS;
  const row = Math.floor(seatIndex / GRID_COLS);
  // タイルの中心に配置
  return {
    x: col * TILE_W + TILE_W / 2,
    y: row * TILE_H + TILE_H / 2,
  };
}

/**
 * 在室者全員のアバター（プレースホルダー円 + ユーザー名）を
 * 各座席の座標に描画するコンポーネント
 *
 * 将来的にドット絵スプライトに置き換えることを想定した仮実装。
 */
export default function Occupants() {
  const { app } = useApplication();
  const { user: myUser } = useDiscordStore();
  const { occupants } = useRoomStore();
  const graphicsRef = useRef<Graphics | null>(null);
  const labelsRef = useRef<Text[]>([]);

  useEffect(() => {
    // 前回描画したGraphicsとTextをクリア
    if (graphicsRef.current) {
      app.stage.children
        .find((c) => c === graphicsRef.current)
        ?.destroy();
    }
    labelsRef.current.forEach((t) => t.destroy());
    labelsRef.current = [];

    const g = new Graphics();
    graphicsRef.current = g;
    // フロア(index:0)の上に重ねる
    app.stage.addChildAt(g, Math.min(1, app.stage.children.length));

    const texts: Text[] = [];

    for (const occupant of occupants.values()) {
      const { x, y } = seatIndexToXY(occupant.seat_index);
      const isSelf = occupant.user_id === myUser?.id;
      const color = isSelf ? COLOR_SELF : COLOR_OTHER;

      // アバター円（仮）
      g.circle(x, y, AVATAR_RADIUS).fill({ color, alpha: 0.85 });
      // 枠線
      g.circle(x, y, AVATAR_RADIUS).stroke({ color: 0xffffff, width: 1.5, alpha: 0.5 });

      // ユーザー名ラベル
      const label = new Text({
        text: occupant.display_name,
        style: new TextStyle({
          fontSize: 10,
          fill: 0xffffff,
          align: 'center',
          fontFamily: 'sans-serif',
          dropShadow: {
            color: 0x000000,
            blur: 2,
            distance: 1,
            alpha: 0.8,
          },
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
      g.destroy();
      texts.forEach((t) => t.destroy());
    };
  }, [app, occupants, myUser]);

  return null;
}
