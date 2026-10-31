import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/constants/voxel';
import { AvatarModelProps } from '@/types/avatar';
import { AvatarRarityEffects } from '@/components/models/avatars/common/AvatarRarityEffects';

/**
 * GentlemanPenguinModel (Rare)
 * シルクハット、モノクル、蝶ネクタイ、ステッキを身にまとった紳士ペンギン
 * - 発言時 (isSpeaking = true): くちばしがパカパカ開き、ステッキを持った右手が小粋に傾く
 * - 着席時 (isSitting = true): 黄色い足を前方にちょこんと揃えて座る
 */
export function GentlemanPenguinModel({
  color = COLORS.PENGUIN_BLACK,
  skinColor = COLORS.PENGUIN_WHITE,
  accentColor = '#dc2626', // ルビーレッド（リボン & 蝶ネクタイ）
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  const beakRef = useRef<THREE.Group>(null);
  const caneArmRef = useRef<THREE.Group>(null);
  const leftFlipperRef = useRef<THREE.Group>(null);

  // ゴールドアクセント
  const goldColor = '#fbbf24';
  const caneWoodColor = '#78350f';

  // アニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (isSpeaking) {
      // くちばしの開閉アニメーション (12Hz)
      const beakOpen = (Math.sin(t * 14) * 0.5 + 0.5) * 0.04;
      if (beakRef.current) {
        beakRef.current.position.y = 0.52 - beakOpen;
      }

      // ステッキを持った右手が小粋に傾く・リズムを取る
      const caneTilt = Math.sin(t * 7) * 0.15;
      if (caneArmRef.current) {
        caneArmRef.current.rotation.z = -0.1 + caneTilt;
        caneArmRef.current.rotation.x = Math.cos(t * 7) * 0.08;
      }

      // 左羽の上品なパタパタ
      if (leftFlipperRef.current) {
        leftFlipperRef.current.rotation.z = -0.15 - Math.sin(t * 10) * 0.12;
      }
    } else {
      if (beakRef.current) {
        beakRef.current.position.y = 0.52;
      }
      if (caneArmRef.current) {
        caneArmRef.current.rotation.z = -0.05;
        caneArmRef.current.rotation.x = 0;
      }
      if (leftFlipperRef.current) {
        leftFlipperRef.current.rotation.z = -0.15;
      }
    }
  });

  return (
    <group>
      {/* 胴体 (Body) */}
      <mesh name="Body" castShadow position={[0, 0.36, 0]}>
        <boxGeometry args={[0.42, 0.48, 0.34]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* お腹 (Belly) */}
      <mesh name="Belly" castShadow position={[0, 0.32, 0.15]}>
        <boxGeometry args={[0.32, 0.38, 0.06]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* 胸の蝶ネクタイ (Bow Tie) */}
      <group position={[0, 0.46, 0.19]}>
        {/* 結び目 */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.03]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        {/* 左リボン */}
        <mesh castShadow position={[-0.045, 0.005, -0.005]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.06, 0.045, 0.02]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        {/* 右リボン */}
        <mesh castShadow position={[0.045, 0.005, -0.005]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.06, 0.045, 0.02]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>

      {/* 目 (Eyes) */}
      <group position={[0, 0.56, 0.16]}>
        {/* 左目 (通常) */}
        <mesh castShadow position={[-0.09, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
        </mesh>
        <mesh castShadow position={[-0.09, 0, 0.012]}>
          <boxGeometry args={[0.02, 0.02, 0.01]} />
          <meshStandardMaterial color="#09090b" />
        </mesh>

        {/* 右目 (モノクル装着) */}
        <mesh castShadow position={[0.09, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
        </mesh>
        <mesh castShadow position={[0.09, 0, 0.012]}>
          <boxGeometry args={[0.02, 0.02, 0.01]} />
          <meshStandardMaterial color="#09090b" />
        </mesh>

        {/* モノクルフレーム (Gold Monocle) */}
        <group position={[0.09, 0, 0.025]}>
          {/* 金枠 */}
          <mesh castShadow>
            <boxGeometry args={[0.07, 0.07, 0.01]} />
            <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.2} />
          </mesh>
          {/* レンズ (半透明シアン) */}
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.05, 0.05, 0.005]} />
            <meshStandardMaterial
              color="#a5f3fc"
              transparent
              opacity={0.65}
              roughness={0.1}
            />
          </mesh>
          {/* モノクルチェーン (右下に伸びる) */}
          <mesh position={[0.035, -0.05, -0.01]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.01, 0.07, 0.01]} />
            <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* くちばし (上部 & 下部: useFrameでパカパカ開閉) */}
      {/* 上くちばし */}
      <mesh castShadow position={[0, 0.54, 0.20]}>
        <boxGeometry args={[0.11, 0.04, 0.10]} />
        <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} roughness={0.4} />
      </mesh>
      {/* 下くちばし (refで開閉) */}
      <group ref={beakRef} position={[0, 0.52, 0.20]}>
        <mesh castShadow position={[0, -0.015, -0.01]}>
          <boxGeometry args={[0.09, 0.03, 0.08]} />
          <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} roughness={0.4} />
        </mesh>
      </group>

      {/* シルクハット (Top Hat) */}
      <group position={[0, 0.60, 0.02]} rotation={[-0.05, 0, -0.04]}>
        {/* つば (Brim) */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.44, 0.025, 0.40]} />
          <meshStandardMaterial color="#18181b" roughness={0.5} />
        </mesh>
        {/* リボン帯 (Red Ribbon) */}
        <mesh castShadow position={[0, 0.03, 0]}>
          <boxGeometry args={[0.29, 0.035, 0.27]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        {/* クラウン (Hat Crown) */}
        <mesh castShadow position={[0, 0.15, 0]}>
          <boxGeometry args={[0.28, 0.21, 0.26]} />
          <meshStandardMaterial color="#18181b" roughness={0.5} />
        </mesh>
      </group>

      {/* 左羽 (Left Flipper) */}
      <group ref={leftFlipperRef} position={[-0.22, 0.36, 0.02]} rotation={[0, 0, -0.15]}>
        <mesh castShadow position={[-0.02, -0.1, 0]}>
          <boxGeometry args={[0.06, 0.26, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      </group>

      {/* 右手 & 木製ステッキ (Right Arm with Cane) */}
      <group ref={caneArmRef} position={[0.22, 0.36, 0.02]} rotation={[0, 0, -0.05]}>
        {/* 右羽 */}
        <mesh castShadow position={[0.02, -0.08, 0.04]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.06, 0.24, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>

        {/* 木製ステッキ (Gentleman Cane) */}
        <group position={[0.07, -0.12, 0.14]}>
          {/* 金のハンドル (ノブ) */}
          <mesh castShadow position={[0, 0.18, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color={goldColor} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh castShadow position={[0, 0.19, -0.03]}>
            <boxGeometry args={[0.04, 0.03, 0.06]} />
            <meshStandardMaterial color={goldColor} metalness={0.9} roughness={0.2} />
          </mesh>

          {/* 木製シャフト (Wood Shaft) */}
          <mesh castShadow position={[0, -0.06, 0]}>
            <boxGeometry args={[0.026, 0.44, 0.026]} />
            <meshStandardMaterial color={caneWoodColor} roughness={0.6} />
          </mesh>

          {/* 金の石突 (Tip) */}
          <mesh castShadow position={[0, -0.28, 0]}>
            <boxGeometry args={[0.03, 0.04, 0.03]} />
            <meshStandardMaterial color={goldColor} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 足 (Feet: isSitting で切り替え) */}
      {isSitting ? (
        <group name="Feet_Sitting" position={[0, 0.06, 0.14]}>
          <mesh castShadow position={[0.1, 0, 0.06]} rotation={[-0.2, 0, 0.05]}>
            <boxGeometry args={[0.12, 0.05, 0.24]} />
            <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} roughness={0.4} />
          </mesh>
          <mesh castShadow position={[-0.1, 0, 0.06]} rotation={[-0.2, 0, -0.05]}>
            <boxGeometry args={[0.12, 0.05, 0.24]} />
            <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} roughness={0.4} />
          </mesh>
        </group>
      ) : (
        <group name="Feet_Standing" position={[0, 0.025, 0.02]}>
          <mesh castShadow position={[0.1, 0, 0.04]}>
            <boxGeometry args={[0.13, 0.05, 0.22]} />
            <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} roughness={0.4} />
          </mesh>
          <mesh castShadow position={[-0.1, 0, 0.04]}>
            <boxGeometry args={[0.13, 0.05, 0.22]} />
            <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* レアリティ共通エフェクト */}
      <AvatarRarityEffects
        rarity="rare"
        isSpeaking={isSpeaking}
        isSitting={isSitting}
        accentColor={accentColor}
      />
    </group>
  );
}
