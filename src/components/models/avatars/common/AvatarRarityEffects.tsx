import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarRarity } from '@/types/avatar';
import { RARITY_LEVEL } from './useAvatarGimmick';

export interface AvatarRarityEffectsProps {
  rarity: AvatarRarity;
  isSpeaking?: boolean;
  isSitting?: boolean;
  voiceVolume?: number;
  isShouting?: boolean;
  accentColor?: string;
}

/**
 * AvatarRarityEffects
 * レアリティ（Epic / Legendary / Ultimate）に応じたエフェクトを描画する共通コンポーネント
 * - 声の大きさ (voiceVolume) や 大声シャウト (isShouting) に応じて演出スケールが激変！
 * - Epic: 通常は浮遊光粒子 ➔ 大声で【雷光スパーク＆閃光ストロボ】
 * - Legendary: 通常は二重反転魔法陣 ➔ 大声で【部屋全体への領域展開メガ魔法陣 ＆ 衝撃波ショックウェーブ ＆ プラズマ光柱】
 * - Common / Rare: 負荷抑制のため描画スキップ (null)
 */
export function AvatarRarityEffects({
  rarity,
  isSpeaking = false,
  isSitting = false,
  voiceVolume = 0,
  isShouting = false,
  accentColor,
}: AvatarRarityEffectsProps) {
  const rarityLevel = RARITY_LEVEL[rarity] ?? 1;

  const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.6);

  const particleGroupRef = useRef<THREE.Group>(null);
  const outerCircleRef = useRef<THREE.Mesh>(null);
  const innerCircleRef = useRef<THREE.Mesh>(null);
  const megaCircleRef = useRef<THREE.Mesh>(null);
  const runesGroupRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const energyPillarRef = useRef<THREE.Mesh>(null);

  // レアリティごとのデフォルトカラー
  const effectColor = accentColor || (
    rarity === 'ultimate' ? '#ec4899' :
    rarity === 'legendary' ? '#00f0ff' :
    rarity === 'epic' ? '#a855f7' :
    '#38bdf8'
  );

  const secondaryColor = rarity === 'legendary' ? '#f59e0b' : '#38bdf8';

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // 1. Epic以上: 浮遊粒子の旋回
    if (particleGroupRef.current) {
      const speed = isOverdrive ? 4.5 : isSpeaking ? 1.8 : 0.6;
      particleGroupRef.current.rotation.y = t * speed;
      particleGroupRef.current.position.y = (isSitting ? 0.35 : 0.5) + Math.sin(t * (isOverdrive ? 6 : 2)) * 0.05;
      const pScale = isOverdrive ? 1.6 : 1.0;
      particleGroupRef.current.scale.set(pScale, pScale, pScale);
    }

    // 2. Legendary以上: 二重反転リング & メガ魔法陣の回転
    if (outerCircleRef.current) {
      outerCircleRef.current.rotation.z = t * (isOverdrive ? 1.8 : 0.4);
    }
    if (innerCircleRef.current) {
      innerCircleRef.current.rotation.z = -t * (isOverdrive ? 2.5 : 0.6);
    }
    if (megaCircleRef.current) {
      megaCircleRef.current.rotation.z = t * 0.25;
      const megaScale = isOverdrive ? 1.0 + Math.sin(t * 8) * 0.08 : 0.7;
      megaCircleRef.current.scale.set(megaScale, megaScale, 1);
    }
    if (runesGroupRef.current) {
      runesGroupRef.current.rotation.z = t * (isOverdrive ? 1.5 : 0.4);
    }

    // 3. Legendary大声時: 衝撃波リングの高速拡散 (Shockwave)
    if (shockwaveRef.current) {
      if (isOverdrive) {
        const sw = (t * 2.2) % 1;
        const scale = 0.5 + sw * 2.5;
        shockwaveRef.current.scale.set(scale, scale, 1);
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = (1 - sw) * 0.85;
      } else {
        shockwaveRef.current.scale.set(0, 0, 0);
      }
    }

    // 4. Legendary大声時: プラズマエナジーピラー（吹き上がる光柱）
    if (energyPillarRef.current) {
      if (isOverdrive) {
        const pillarPulse = 1.0 + Math.sin(t * 25) * 0.25;
        energyPillarRef.current.scale.set(pillarPulse, 1.0 + Math.sin(t * 15) * 0.1, pillarPulse);
        const mat = energyPillarRef.current.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = 0.4 + Math.sin(t * 30) * 0.25;
      } else {
        energyPillarRef.current.scale.set(0, 0, 0);
      }
    }
  });

  // Common / Rare は演出スキップ (負荷抑制)
  if (rarityLevel < 3) {
    return null;
  }

  const baseY = isSitting ? 0.06 : 0.02;

  return (
    <group position={[0, baseY, 0]}>
      {/* 1. ダイナミックポイントライト (大声時は強烈なストロボ照明！) */}
      <pointLight
        color={effectColor}
        intensity={isOverdrive ? (rarityLevel >= 4 ? 10.0 : 6.0) : isSpeaking ? 2.5 : 0.5}
        distance={isOverdrive ? 5.5 : 2.0}
        decay={2}
        position={[0, 0.5, 0.1]}
      />

      {/* 2. Epic以上: アバター周囲を旋回するエナジーキューブ粒子群 (大声時は8個に倍増) */}
      <group ref={particleGroupRef} position={[0, isSitting ? 0.35 : 0.5, 0]}>
        {(isOverdrive ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 3]).map((i, _, arr) => {
          const angle = (i / arr.length) * Math.PI * 2;
          const radius = isOverdrive ? 0.48 : 0.34;
          const yOffset = (i % 2 === 0 ? 0.12 : -0.12);
          const size = isOverdrive ? 0.045 : 0.03;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius]}
            >
              <boxGeometry args={[size, size, size]} />
              <meshBasicMaterial
                color={i % 2 === 0 ? effectColor : secondaryColor}
                transparent
                opacity={isOverdrive ? 0.95 : 0.75}
              />
            </mesh>
          );
        })}
      </group>

      {/* 3. Legendary以上: 足元に浮かぶ二重反転ネオンエナジー魔法陣 */}
      {rarityLevel >= 4 && (
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {/* 外周リング */}
          <mesh ref={outerCircleRef}>
            <ringGeometry args={[0.38, 0.42, 32]} />
            <meshBasicMaterial
              color={effectColor}
              transparent
              opacity={isOverdrive ? 0.95 : 0.65}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* 内周リング */}
          <mesh ref={innerCircleRef}>
            <ringGeometry args={[0.26, 0.29, 24]} />
            <meshBasicMaterial
              color={secondaryColor}
              transparent
              opacity={isOverdrive ? 0.9 : 0.5}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* 4方位のサイバールーンボクセル */}
          <group ref={runesGroupRef}>
            {[0, 1, 2, 3].map((i) => {
              const a = (i / 4) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.46, Math.sin(a) * 0.46, 0.005]}>
                  <boxGeometry args={[0.04, 0.04, 0.01]} />
                  <meshBasicMaterial color={effectColor} />
                </mesh>
              );
            })}
          </group>

          {/* 大声時の部屋全体領域展開メガ魔法陣サークル (半径1.2m!) */}
          {isOverdrive && (
            <mesh ref={megaCircleRef} position={[0, 0, -0.005]}>
              <ringGeometry args={[0.9, 1.15, 48]} />
              <meshBasicMaterial
                color={effectColor}
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* 大声時の拡散衝撃波ショックウェーブ */}
          <mesh ref={shockwaveRef} position={[0, 0, 0.01]}>
            <ringGeometry args={[0.4, 0.48, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 4. Legendary大声時: 天空へ噴き上がるプラズマ光柱ピラー */}
      {rarityLevel >= 4 && (
        <mesh ref={energyPillarRef} position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.25, 0.35, 1.8, 16, 1, true]} />
          <meshBasicMaterial
            color={effectColor}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}
