'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stage, Center } from '@react-three/drei';
import { DynamicFurniture } from '@/components/office/DynamicFurniture';
import { RoomItem } from '@/constants/roomItems';

interface Props {
  item: RoomItem;
}

/**
 * FurniturePreview
 * インベントリ内で家具の3Dモデルを表示するためのプレビューコンポーネント
 */
export function FurniturePreview({ item }: Props) {
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas
        shadows
        orthographic
        camera={{ position: [5, 5, 5], zoom: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Stage
            intensity={1.0}
            environment={null}
            adjustCamera={1.5}
            shadows="contact"
          >
            <Center>
              <DynamicFurniture 
                item={item} 
                opacity={1} 
                rotation={-Math.PI / 4} // 少し斜めに向けて見やすくする
              />
            </Center>
          </Stage>
        </Suspense>
      </Canvas>
    </div>
  );
}
