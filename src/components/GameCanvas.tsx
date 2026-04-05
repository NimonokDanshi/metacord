'use client';

import { useState, useEffect } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text, Sprite, Texture, Assets } from 'pixi.js';
import { useRoom } from '@/hooks/useRoom';
import Room from './Room';
import Furniture from './Furniture';
import Occupants from './Occupants';
import { COLOR_BG, VOXEL_ATLAS_URL } from '@/constants/layout';

// @pixi/react で使用するPixiJSクラスを登録する
extend({ Container, Graphics, Text, Sprite, Texture });

export default function GameCanvas() {
  useRoom();
  const [isLoaded, setIsLoaded] = useState(false);

  // ボクセルアトラスのプリロード
  useEffect(() => {
    async function loadAssets() {
      try {
        await Assets.load(VOXEL_ATLAS_URL);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load voxel atlas:', error);
      }
    }
    loadAssets();
  }, []);

  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{ background: `#${COLOR_BG.toString(16).padStart(6, '0')}` }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black text-white font-pixel">
          <div className="text-xl animate-pulse">LOADING OFFICE...</div>
        </div>
      )}

      <Application
        resizeTo={typeof window !== 'undefined' ? window : undefined}
        background={COLOR_BG}
        antialias={false}
        resolution={typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1}
        autoDensity={true}
      >
        {/* アセットロード完了時のみ描画 */}
        {isLoaded && (
          <>
            <Room />
            <Furniture />
            <Occupants />
          </>
        )}
      </Application>
    </div>
  );
}
