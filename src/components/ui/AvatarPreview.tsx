import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, ContactShadows } from '@react-three/drei';

interface Props {
  component: React.ComponentType<any>;
}

/**
 * AvatarPreview
 * モーダル内で個別の3Dアバターを表示するための軽量なプレビューコンポーネント
 */
export function AvatarPreview({ component: AvatarModel }: Props) {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [5, 5, 5], zoom: 50 }}>
        <OrthographicCamera
          makeDefault
          position={[5, 4, 5]}
          zoom={50}
        />
        
        {/* 照明 - 少し明るめに設定 */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 5, 2]} intensity={1.5} />
        
        <group position={[0, -0.4, 0]}>
          <AvatarModel isSitting={false} />
        </group>

        <ContactShadows
          opacity={0.4}
          scale={5}
          blur={2.4}
          far={10}
          resolution={128}
          color="#000000"
        />
      </Canvas>
    </div>
  );
}
