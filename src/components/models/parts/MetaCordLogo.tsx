import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isSpeaking?: boolean;
}

/**
 * MetaCordLogo
 * DiscordのClydeフェイスに発話波紋 (Voice Waves) を組み合わせた、シンプルで洗練されたボクセルロゴプレート。
 * 主張しすぎず、部屋の壁に品良く馴染むミニマルな額縁アートデザイン。
 */
export function MetaCordLogo({
  position = [0, 2.0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  isSpeaking = false,
}: Props) {
  const wave1MatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wave2MatRef = useRef<THREE.MeshStandardMaterial>(null);

  const blurple = '#5865F2';  // Discord 公式ブラープル
  const voiceGreen = '#57F287'; // Discord 公式ボイスグリーン
  const frameColor = '#334155'; // 落ち着いたスレートフレーム
  const plateBg = '#1e293b';    // プレート下地

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // 誰かが喋っている時、または待機時に優しく波紋が明滅
    const pulse1 = isSpeaking
      ? (Math.sin(t * 10) * 0.5 + 0.5) * 1.5 + 1.2
      : (Math.sin(t * 2) * 0.3 + 0.7);
    const pulse2 = isSpeaking
      ? (Math.sin(t * 10 - 0.8) * 0.5 + 0.5) * 1.5 + 1.2
      : (Math.sin(t * 2 - 0.5) * 0.3 + 0.7);

    if (wave1MatRef.current) wave1MatRef.current.emissiveIntensity = pulse1;
    if (wave2MatRef.current) wave2MatRef.current.emissiveIntensity = pulse2;
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 額縁フレーム (アルミ/スレート調) */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.05, 0.75, 0.04]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* プレート下地 */}
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[0.96, 0.66, 0.01]} />
        <meshStandardMaterial color={plateBg} roughness={0.8} />
      </mesh>

      {/* --- Discord Clyde ミニマルボクセルフェイス --- */}
      <group position={[-0.06, 0, 0.035]}>
        {/* メインフェイス */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.38, 0.26, 0.02]} />
          <meshStandardMaterial color={blurple} roughness={0.5} />
        </mesh>

        {/* 左右の上部アンテナ/角 */}
        <mesh position={[-0.14, 0.15, 0]}>
          <boxGeometry args={[0.07, 0.06, 0.02]} />
          <meshStandardMaterial color={blurple} roughness={0.5} />
        </mesh>
        <mesh position={[0.14, 0.15, 0]}>
          <boxGeometry args={[0.07, 0.06, 0.02]} />
          <meshStandardMaterial color={blurple} roughness={0.5} />
        </mesh>

        {/* 左右の目 (つぶらな白ピクセル) */}
        <mesh position={[-0.08, 0.02, 0.012]}>
          <boxGeometry args={[0.06, 0.08, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.08, 0.02, 0.012]}>
          <boxGeometry args={[0.06, 0.08, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* 下部のコントローラーグリップライン */}
        <mesh position={[-0.15, -0.15, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color={blurple} roughness={0.5} />
        </mesh>
        <mesh position={[0.15, -0.15, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color={blurple} roughness={0.5} />
        </mesh>
      </group>

      {/* --- 右上の発話波紋 (Voice Waves) --- */}
      <group position={[0.24, 0.05, 0.035]}>
        {/* 1本目の波 (内側・小) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.025, 0.14, 0.02]} />
          <meshStandardMaterial
            ref={wave1MatRef}
            color={voiceGreen}
            emissive={voiceGreen}
            emissiveIntensity={1.0}
            roughness={0.2}
          />
        </mesh>

        {/* 2本目の波 (外側・大) */}
        <mesh position={[0.07, 0, 0]}>
          <boxGeometry args={[0.025, 0.22, 0.02]} />
          <meshStandardMaterial
            ref={wave2MatRef}
            color={voiceGreen}
            emissive={voiceGreen}
            emissiveIntensity={1.0}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}
