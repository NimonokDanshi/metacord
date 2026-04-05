'use client';

import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text } from 'pixi.js';
import { useRoom } from '@/hooks/useRoom';
import Room from './Room';
import Occupants from './Occupants';
import { COLOR_BG } from '@/constants/layout';

// @pixi/react で使用するPixiJSクラスを登録する
extend({ Container, Graphics, Text });

export default function GameCanvas() {
  useRoom();

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
