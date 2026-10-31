import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarRarity } from '@/types/avatar';
import { RARITY_LEVEL } from './useAvatarGimmick';

export interface AvatarRarityEffectsProps {
  rarity: AvatarRarity;
  isSpeaking?: boolean;
  isSitting?: boolean;
  accentColor?: string;
}

/**
 * AvatarRarityEffects
 * レアリティ（Epic / Legendary / Ultimate）に応じたエフェクトを描画する共通コンポーネント
 * - Epic: 旋回浮遊エナジーキューブ粒子 + ポイントライト
 * - Legendary: Epic全機能 + 足元の二重反転エナジー魔法陣サークル + ルーンチップ
 * - Ultimate: Legendary全機能 + 地面パルス波紋リング
 * - Common / Rare: 負荷抑制のため描画スキップ (null)
 */
export function AvatarRarityEffects({
  rarity,
  isSpeaking = false,
  isSitting = false,
  accentColor,
}: AvatarRarityEffectsProps) {
  const rarityLevel = RARITY_LEVEL[rarity] ?? 1;

  const particleGroupRef = useRef<THREE.Group>(null);
  const outerCircleRef = useRef<THREE.Mesh>(null);
  const innerCircleRef = useRef<THREE.Mesh>(null);
  const runesGroupRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);

  // レアリティごとのデフォルトカラー
  const effectColor = accentColor || (
    rarity === 'ultimate' ? '#ec4899' :
    rarity === 'legendary' ? '#00f0ff' :
    rarity === 'epic' ? '#a855f7' :
    '#38bdf8'
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // 1. Epic以上: 浮遊粒子の旋回
    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.y = t * (isSpeaking ? 1.6 : 0.6);
      particleGroupRef.current.position.y = (isSitting ? 0.35 : 0.5) + Math.sin(t * 2) * 0.04;
    }

    // 2. Legendary以上: 二重反転リング & ルーンチップの回転
    if (outerCircleRef.current) {
      outerCircleRef.current.rotation.z = t * 0.4;
    }
    if (innerCircleRef.current) {
      innerCircleRef.current.rotation.z = -t * 0.6;
    }
    if (runesGroupRef.current) {
      runesGroupRef.current.rotation.z = t * 0.4;
    }

    // 3. Ultimate: パルス波紋リングのスケール拡大 & フェード
    if (pulseRingRef.current) {
      const pulseT = (t * 1.5) % 1;
      const s = 1.0 + pulseT * 0.8;
      pulseRingRef.current.scale.set(s, s, 1);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = (1 - pulseT) * (isSpeaking ? 0.7 : 0.35);
      }
    }
  });

  // Common / Rare は過剰演出を避けパフォーマンスを最優先
  if (rarityLevel < 3) {
    return null;
  }

  const baseY = isSitting ? 0.06 : 0.02;

  return (
    <group position={[0, baseY, 0]}>
      {/* 1. Epic以上: ポイントライト */}
      <pointLight
        color={effectColor}
        intensity={isSpeaking ? 1.8 : 0.4}
        distance={1.6}
        decay={2}
        position={[0, 0.4, 0.1]}
      />

      {/* 2. Epic以上: アバター周囲を旋回する光のエナジーキューブ粒子 */}
      <group ref={particleGroupRef} position={[0, isSitting ? 0.35 : 0.5, 0]}>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          const radius = 0.34;
          const yOffset = (i % 2 === 0 ? 0.08 : -0.08);
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius]}
            >
              <boxGeometry args={[0.025, 0.025, 0.025]} />
              <meshBasicMaterial
                color={effectColor}
                transparent
                opacity={isSpeaking ? 0.95 : 0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* 3. Legendary以上: 二重反転魔法陣・エナジーサークル */}
      {rarityLevel >= 4 && (
        <group position={[0, 0.01, 0]}>
          {/* 外周リング */}
          <mesh ref={outerCircleRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.42, 0.44, 32]} />
            <meshBasicMaterial
              color={effectColor}
              transparent
              opacity={isSpeaking ? 0.8 : 0.4}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* 内周リング (反転回転) */}
          <mesh ref={innerCircleRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.30, 0.315, 32]} />
            <meshBasicMaterial
              color={effectColor}
              transparent
              opacity={isSpeaking ? 0.6 : 0.3}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* 4方位ボクセルルーンチップ */}
          <group ref={runesGroupRef} rotation={[-Math.PI / 2, 0, 0]}>
            {[0, 1, 2, 3].map((i) => {
              const angle = (i / 4) * Math.PI * 2;
              const r = 0.43;
              return (
                <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0.005]}>
                  <boxGeometry args={[0.035, 0.035, 0.01]} />
                  <meshBasicMaterial
                    color={effectColor}
                    transparent
                    opacity={isSpeaking ? 0.9 : 0.5}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      )}

      {/* 4. Ultimate: パルス波紋リング */}
      {rarityLevel >= 5 && (
        <mesh ref={pulseRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[0.45, 0.47, 32]} />
          <meshBasicMaterial
            color={effectColor}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
