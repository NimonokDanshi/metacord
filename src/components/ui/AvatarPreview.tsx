import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import { AvatarModelProps } from '@/types/avatar';

interface Props {
  component: React.ComponentType<AvatarModelProps>;
}

/**
 * 舞台風の円形展示ステージ (ポディウム台座)
 */
function ShowcasePodium() {
  return (
    <group position={[0, -0.01, 0]}>
      {/* 台座本体 */}
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.08, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* ステージ外周のネオンリング (光の輪) */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.51, 0.55, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

/**
 * AvatarPreview
 * 正確に中央配置（センタリング）され、アバターが大きくハッキリ見えるプレビュー
 */
export function AvatarPreview({ component: AvatarModel }: Props) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        orthographic
        camera={{ position: [5, 4, 5], zoom: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 全体を明るくする環境光 */}
        <ambientLight intensity={1.7} />

        {/* 舞台メイントップライト */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[512, 512]}
        />

        {/* 背後からのリムライト (輪郭光) */}
        <directionalLight
          position={[-4, 5, -4]}
          intensity={2.8}
          color="#93c5fd"
        />

        {/* 上下・左右ともに完全中央配置 */}
        <Suspense fallback={null}>
          <Center>
            <AvatarModel isSitting={false} />
            <ShowcasePodium />
          </Center>
        </Suspense>
      </Canvas>
    </div>
  );
}
