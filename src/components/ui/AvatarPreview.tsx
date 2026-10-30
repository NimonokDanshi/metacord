import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import { AvatarModelProps } from '@/types/avatar';

interface Props {
  component: React.ComponentType<AvatarModelProps>;
}

/**
 * 舞台風の円形展示ステージ (ポディウム)
 */
function ShowcasePodium() {
  return (
    <group position={[0, -0.02, 0]}>
      {/* 台座本体 */}
      <mesh receiveShadow position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.52, 0.56, 0.06, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* ステージ外周のネオンリング (光の輪) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.52, 24]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

/**
 * AvatarPreview
 * スポットライトとリムライト（輪郭光）が当たる舞台風ステージでアバターを表示。
 * 黒いドラゴンやペンギンでも輪郭がくっきり美しく浮き上がります。
 */
export function AvatarPreview({ component: AvatarModel }: Props) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        orthographic
        camera={{ position: [5, 4.5, 5], zoom: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 全体を明るくする環境光 (黒つぶれ防止) */}
        <ambientLight intensity={1.6} />

        {/* 舞台の上からのメイントップライト */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[512, 512]}
        />

        {/* 背後からのリムライト (輪郭光) - 暗いアバターのシルエットを際立たせる */}
        <directionalLight
          position={[-4, 5, -4]}
          intensity={2.5}
          color="#93c5fd"
        />

        {/* 下からのほんのりバウンス光 */}
        <pointLight position={[0, -1, 0]} intensity={0.5} color="#38bdf8" />

        <Suspense fallback={null}>
          <Center top>
            <AvatarModel isSitting={false} />
            <ShowcasePodium />
          </Center>
        </Suspense>
      </Canvas>
    </div>
  );
}
