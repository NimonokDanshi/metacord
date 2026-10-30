import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import { AvatarModelProps } from '@/types/avatar';

interface Props {
  component: React.ComponentType<AvatarModelProps>;
}

/**
 * AvatarPreview
 * 正確に中央配置され、枠いっぱいに大きくハッキリ見えるアバタープレビュー
 */
export function AvatarPreview({ component: AvatarModel }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Canvas
        shadows
        orthographic
        camera={{ position: [5, 3.8, 5], zoom: 115 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 全体を明るくする環境光 */}
        <ambientLight intensity={1.8} />

        {/* メイントップライト */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[512, 512]}
        />

        {/* 輪郭を際立たせるリムライト */}
        <directionalLight
          position={[-4, 5, -4]}
          intensity={2.6}
          color="#93c5fd"
        />

        {/* 上下・左右ともに完全中央配置（余分なステージは撤廃し、モデル単体をドアップ表示） */}
        <Suspense fallback={null}>
          <Center>
            <AvatarModel isSitting={false} />
          </Center>
        </Suspense>
      </Canvas>
    </div>
  );
}
