'use client';

import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text } from 'pixi.js';
import { useRoom } from '@/hooks/useRoom';
import Room from './Room';
import Occupants from './Occupants';
import { COLOR_BG } from '@/constants/layout';

// @pixi/react で使用するPixiJSクラスを登録する
extend({ Container, Graphics, Text });

const CHANNEL_NAME = 'main';

/**
 * PixiJSのApplicationを初期化し、2D仮想空間を描画するメインキャンバス
 * - useRoom() で Supabase Presence を購読し、在室者の着席状態を管理する
 * - Room / Occupants は useApplication() 経由で app.screen を参照し、
 *   自前で中央寄せ座標を計算する（JSX pixiContainer のオフセットは使用しない）
 */
export default function GameCanvas() {
  useRoom(CHANNEL_NAME);

  return (
    <div
      className="w-full h-full"
      style={{ background: `#${COLOR_BG.toString(16).padStart(6, '0')}` }}
    >
      <Application
        resizeTo={typeof window !== 'undefined' ? window : undefined}
        background={COLOR_BG}
        antialias={false}
        resolution={typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1}
        autoDensity={true}
      >
        {/* Room・Occupantsは useApplication() 経由で app.stage に直接描画する */}
        <Room />
        <Occupants />
      </Application>
    </div>
  );
}
