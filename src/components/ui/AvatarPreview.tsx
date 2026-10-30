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
 * adjustCamera=1.45 により周囲に十分なセーフエリアを確保し、
 * カード枠内のバッジや「？」ボタンとアバターの角や耳が被らないように設計。
 */
export function AvatarPreview({ component: AvatarModel }: Props) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        orthographic
        camera={{ position: [5, 5, 5], zoom: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Stage
            intensity={1.0}
            environment={null}
            adjustCamera={1.45} // 十分な余白を確保してアイコン被りを防止
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
