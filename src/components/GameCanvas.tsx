'use client';

import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { useRoom } from '@/hooks/useRoom';
import Room from './Room';
import Occupants from './Occupants';
import { COLOR_BG, ROOM_WIDTH, ROOM_HEIGHT } from '@/constants/layout';

// @pixi/react で使用するPixiJSクラスを登録する
extend({ Container, Graphics, Text });

// TODO: 将来的にDiscordのチャンネルIDを使って部屋を分離する
const CHANNEL_NAME = 'main';

/**
 * PixiJSのApplicationを初期化し、2D仮想空間を描画するメインキャンバス
 * useRoom() で Supabase Presence を購読し、在室者の着席状態を管理する
 */
export default function GameCanvas() {
  // Supabase Realtime Presence の購読を開始（入室）
  useRoom(CHANNEL_NAME);

  const offsetX = typeof window !== 'undefined' ? Math.max(0, (window.innerWidth - ROOM_WIDTH) / 2) : 0;
  const offsetY = typeof window !== 'undefined' ? Math.max(0, (window.innerHeight - ROOM_HEIGHT) / 2) : 0;

  return (
    <div
      className="w-full h-full"
      style={{ background: `#${COLOR_BG.toString(16).padStart(6, '0')}` }}
    >
      <Application
        resizeTo={typeof window !== 'undefined' ? window : undefined}
        background={COLOR_BG}
        antialias={false}
        resolution={window.devicePixelRatio || 1}
        autoDensity={true}
      >
        {/* 部屋の中央寄せコンテナ */}
        <pixiContainer x={offsetX} y={offsetY}>
          {/* フロアタイル */}
          <Room />
          {/* 在室者のアバター（着席位置に描画） */}
          <Occupants />
        </pixiContainer>
      </Application>
    </div>
  );
}
