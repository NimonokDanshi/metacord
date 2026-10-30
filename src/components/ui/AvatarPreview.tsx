import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stage, Center } from '@react-three/drei';
import { AvatarModelProps } from '@/types/avatar';

interface Props {
  component: React.ComponentType<AvatarModelProps>;
}

/**
 * AvatarPreview
 * モーダル内で個別の3Dアバターを表示するためのプレビューコンポーネント
 * Stageコンポーネントを使用して、サイズに関わらずモデルを自動調整して表示します。
 */
export function AvatarPreview({ component: AvatarModel }: Props) {
  return (
    <div className="w-full h-full">
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
            adjustCamera={1.2} // 1.2倍の余裕を持ってフィットさせる
            shadows="contact"
          >
            <Center>
              <AvatarModel isSitting={false} />
            </Center>
          </Stage>
        </Suspense>
      </Canvas>
    </div>
  );
}
