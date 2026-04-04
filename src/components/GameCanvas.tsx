'use client';

import { Application, extend } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useRef } from 'react';
import Room from './Room';
import { COLOR_BG, ROOM_WIDTH, ROOM_HEIGHT } from '@/constants/layout';

// @pixi/react で使用するPixiJSクラスを登録する
extend({ Container, Graphics });

/**
 * PixiJSのApplicationを初期化し、2D仮想空間を描画するメインキャンバス
 *
 * - Applicationは<canvas>要素をレンダリングし、
 *   childrenはPixiJSのstage上に描画される
 * - resizeToで親要素のサイズに追従する
 * - RoomコンポーネントがフロアやグリッドをGraphicsで描画する
 */
export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
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
        <pixiContainer
          x={typeof window !== 'undefined' ? Math.max(0, (window.innerWidth - ROOM_WIDTH) / 2) : 0}
          y={typeof window !== 'undefined' ? Math.max(0, (window.innerHeight - ROOM_HEIGHT) / 2) : 0}
        >
          <Room />
        </pixiContainer>
      </Application>
    </div>
  );
}
