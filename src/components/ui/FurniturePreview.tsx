'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import { DynamicFurniture } from '@/components/office/DynamicFurniture';
import { RoomItem } from '@/constants/roomItems';

interface Props {
  item: RoomItem;
}

/**
 * FurniturePreview
 * インベントリ内で家具の3Dモデルを明るくはっきり表示するプレビューコンポーネント
 */
export function FurniturePreview({ item }: Props) {
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas
        shadows
        orthographic
        camera={{ position: [5, 4.5, 5], zoom: 34 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 全体を明るくする環境光 */}
        <ambientLight intensity={1.8} />

        {/* メイントップライト */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[256, 256]}
        />

        {/* 輪郭を際立たせるリムライト */}
        <directionalLight
          position={[-4, 5, -4]}
          intensity={2.0}
          color="#93c5fd"
        />

        <Suspense fallback={null}>
          <Center>
            <DynamicFurniture 
              item={item} 
              opacity={1} 
              rotation={-Math.PI / 4} // 少し斜めに向けて見やすくする
            />
          </Center>
        </Suspense>
      </Canvas>
    </div>
  );
}
