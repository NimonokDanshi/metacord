import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';
import { AvatarRarityEffects } from '@/components/models/avatars/common/AvatarRarityEffects';
import { useAvatarGimmick } from '@/components/models/avatars/common/useAvatarGimmick';

/**
 * VoxelWizardModel (Epic)
 * 魔法のローブ、とんがり魔導士帽子、豊かな白ひげ、エナジークリスタルの杖を携えた大魔導士
 * - 通常発言時: 杖のクリスタルが青くパルス発光し、杖を掲げて呪文を詠唱
 * - 大声シャウト時 (OVERDRIVE): 杖を天高く掲げ、クリスタルから激しい雷光ボクセルが降り注ぎ、周囲を紫光が照らす！
 * - 着席時: ローブの裾を整えて着席
 */
export function VoxelWizardModel({
  color = '#4c1d95',          // ディープパープルの魔導ローブ
  skinColor = '#fed7aa',      // 肌色
  accentColor = '#38bdf8',    // シアンブルーのエナジークリスタル
  isSitting = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: AvatarModelProps) {
  const staffArmRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const crystalMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const beardRef = useRef<THREE.Group>(null);

  const { groupRef, valuesRef } = useAvatarGimmick({
    rarity: 'epic',
    isSitting,
    isSpeaking,
    voiceVolume,
    isShouting,
  });

  const goldTrim = '#fbbf24';       // 金の縁取り
  const beardColor = '#f8fafc';     // 純白のひげ
  const woodStaffColor = '#78350f'; // 古木の杖

  // アニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const isOverdrive = valuesRef.current.isOverdrive;

    if (isOverdrive) {
      // 大声・限界突破詠唱時: 杖を天高く掲げる
      const staffLift = -1.45 + Math.sin(t * 16) * 0.1;
      if (staffArmRef.current) {
        staffArmRef.current.rotation.x = staffLift;
        staffArmRef.current.rotation.z = -0.3;
      }
      // クリスタルの限界突破ストロボ発光
      if (crystalMatRef.current) {
        crystalMatRef.current.emissiveIntensity = 6.0 + Math.sin(t * 30) * 2.0;
      }
      if (crystalRef.current) {
        crystalRef.current.rotation.y = t * 12;
        crystalRef.current.rotation.x = t * 8;
        crystalRef.current.scale.set(1.4, 1.4, 1.4);
      }
      if (beardRef.current) {
        beardRef.current.rotation.x = -0.15 + Math.sin(t * 18) * 0.1;
      }
    } else if (isSpeaking) {
      // 通常詠唱
      const staffLift = -0.7 + Math.sin(t * 6) * 0.12;
      const staffSway = Math.cos(t * 5) * 0.08;
      if (staffArmRef.current) {
        staffArmRef.current.rotation.x = staffLift;
        staffArmRef.current.rotation.z = -0.15 + staffSway;
      }

      const pulse = valuesRef.current.glowIntensity;
      if (crystalMatRef.current) {
        crystalMatRef.current.emissiveIntensity = pulse;
      }
      if (crystalRef.current) {
        crystalRef.current.rotation.y = t * 4;
        crystalRef.current.rotation.x = t * 2;
        crystalRef.current.scale.set(1, 1, 1);
      }
      if (beardRef.current) {
        beardRef.current.rotation.x = Math.sin(t * 10) * 0.08;
      }
    } else {
      if (staffArmRef.current) {
        staffArmRef.current.rotation.x = -0.15;
        staffArmRef.current.rotation.z = -0.05;
      }
      if (crystalMatRef.current) {
        crystalMatRef.current.emissiveIntensity = 1.2;
      }
      if (crystalRef.current) {
        crystalRef.current.rotation.y = t * 0.8;
        crystalRef.current.rotation.x = 0.3;
        crystalRef.current.scale.set(1, 1, 1);
      }
      if (beardRef.current) {
        beardRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 胴体 (Wizard Robe Upper) */}
      <mesh name="RobeTorso" castShadow position={[0, 0.44, 0]}>
        <boxGeometry args={[0.38, 0.36, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* ローブ前面の金トリム飾り (Gold Center Border) */}
      <mesh position={[0, 0.44, 0.142]}>
        <boxGeometry args={[0.06, 0.36, 0.008]} />
        <meshStandardMaterial color={goldTrim} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ローブ裾 (Robe Lower: isSitting で座りポーズ切り替え) */}
      {isSitting ? (
        <group name="Robe_Sitting" position={[0, 0.16, 0.06]}>
          {/* 座席に広がるローブ裾 */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.44, 0.26, 0.38]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* 金縁 */}
          <mesh position={[0, -0.11, 0.192]}>
            <boxGeometry args={[0.44, 0.04, 0.01]} />
            <meshStandardMaterial color={goldTrim} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* ローブから覗く靴先 */}
          <mesh castShadow position={[0.1, -0.09, 0.19]}>
            <boxGeometry args={[0.08, 0.05, 0.08]} />
            <meshStandardMaterial color="#312e81" />
          </mesh>
          <mesh castShadow position={[-0.1, -0.09, 0.19]}>
            <boxGeometry args={[0.08, 0.05, 0.08]} />
            <meshStandardMaterial color="#312e81" />
          </mesh>
        </group>
      ) : (
        <group name="Robe_Standing" position={[0, 0.16, 0]}>
          {/* 末広がりローブスカート */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.42, 0.32, 0.32]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* 下部ゴールドトリム帯 */}
          <mesh position={[0, -0.13, 0]}>
            <boxGeometry args={[0.43, 0.04, 0.33]} />
            <meshStandardMaterial color={goldTrim} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* 前面中央トリム続き */}
          <mesh position={[0, 0, 0.162]}>
            <boxGeometry args={[0.06, 0.32, 0.008]} />
            <meshStandardMaterial color={goldTrim} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* ブーツ先端 */}
          <mesh castShadow position={[0.1, -0.14, 0.14]}>
            <boxGeometry args={[0.09, 0.04, 0.08]} />
            <meshStandardMaterial color="#312e81" />
          </mesh>
          <mesh castShadow position={[-0.1, -0.14, 0.14]}>
            <boxGeometry args={[0.09, 0.04, 0.08]} />
            <meshStandardMaterial color="#312e81" />
          </mesh>
        </group>
      )}

      {/* 頭部 (Head & Face) */}
      <group position={[0, 0.72, 0]}>
        {/* 顔 */}
        <mesh name="Head" castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.26, 0.22, 0.24]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>

        {/* 優しい知的な目 */}
        <mesh position={[0.07, 0.03, 0.122]}>
          <boxGeometry args={[0.03, 0.03, 0.01]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[-0.07, 0.03, 0.122]}>
          <boxGeometry args={[0.03, 0.03, 0.01]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        {/* まゆ毛 */}
        <mesh position={[0.07, 0.06, 0.125]}>
          <boxGeometry args={[0.05, 0.02, 0.01]} />
          <meshStandardMaterial color={beardColor} />
        </mesh>
        <mesh position={[-0.07, 0.06, 0.125]}>
          <boxGeometry args={[0.05, 0.02, 0.01]} />
          <meshStandardMaterial color={beardColor} />
        </mesh>

        {/* 白い口ひげ & 豊かな顎ひげ (Beard: useFrameでかすかに揺れる) */}
        <group ref={beardRef} position={[0, -0.04, 0.12]}>
          {/* 口ひげ */}
          <mesh castShadow position={[0, 0.02, 0.01]}>
            <boxGeometry args={[0.20, 0.04, 0.04]} />
            <meshStandardMaterial color={beardColor} roughness={0.8} />
          </mesh>
          {/* 顎ひげ 上部 */}
          <mesh castShadow position={[0, -0.04, 0.01]}>
            <boxGeometry args={[0.22, 0.08, 0.05]} />
            <meshStandardMaterial color={beardColor} roughness={0.8} />
          </mesh>
          {/* 顎ひげ 中部 */}
          <mesh castShadow position={[0, -0.12, 0.02]}>
            <boxGeometry args={[0.18, 0.09, 0.05]} />
            <meshStandardMaterial color={beardColor} roughness={0.8} />
          </mesh>
          {/* 顎ひげ 下部（長く胸まで垂れる） */}
          <mesh castShadow position={[0, -0.20, 0.03]}>
            <boxGeometry args={[0.12, 0.08, 0.04]} />
            <meshStandardMaterial color={beardColor} roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, -0.26, 0.04]}>
            <boxGeometry args={[0.06, 0.05, 0.03]} />
            <meshStandardMaterial color={beardColor} roughness={0.8} />
          </mesh>
        </group>

        {/* とんがり魔女帽子 (Wizard Hat) */}
        <group position={[0, 0.12, -0.02]} rotation={[-0.08, 0, 0.03]}>
          {/* 大きなつば (Wide Brim) */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.56, 0.03, 0.54]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* 帽子ベルト (Gold Band & Buckle) */}
          <mesh castShadow position={[0, 0.04, 0]}>
            <boxGeometry args={[0.33, 0.05, 0.33]} />
            <meshStandardMaterial color={goldTrim} metalness={0.9} roughness={0.2} />
          </mesh>
          {/* クラウン1段目 */}
          <mesh castShadow position={[0, 0.12, 0]}>
            <boxGeometry args={[0.30, 0.12, 0.30]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* クラウン2段目 */}
          <mesh castShadow position={[0, 0.23, -0.02]}>
            <boxGeometry args={[0.22, 0.11, 0.22]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* クラウン3段目 (後方に少し折れ曲がる) */}
          <mesh castShadow position={[0, 0.33, -0.06]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.15, 0.11, 0.15]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* 先端 (Tip) */}
          <mesh castShadow position={[0, 0.42, -0.11]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.08, 0.09, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* 先端の小さな金オーナメント */}
          <mesh castShadow position={[0, 0.48, -0.14]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color={goldTrim} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 左腕 (Left Arm: ゆったりしたローブ袖) */}
      <group position={[-0.24, 0.50, 0]}>
        <mesh castShadow position={[-0.02, -0.10, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.14, 0.26, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* 袖口金縁 */}
        <mesh position={[-0.03, -0.21, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.15, 0.03, 0.17]} />
          <meshStandardMaterial color={goldTrim} metalness={0.8} />
        </mesh>
        {/* 覗く手 */}
        <mesh castShadow position={[-0.03, -0.24, 0]}>
          <boxGeometry args={[0.08, 0.06, 0.08]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* 右腕 & 魔法の杖 (Right Arm with Energy Staff: useFrameで高く掲げる) */}
      <group ref={staffArmRef} position={[0.24, 0.50, 0]} rotation={[-0.15, 0, -0.05]}>
        {/* ローブ袖 */}
        <mesh castShadow position={[0.02, -0.10, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.14, 0.26, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* 袖口金縁 */}
        <mesh position={[0.03, -0.21, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.15, 0.03, 0.17]} />
          <meshStandardMaterial color={goldTrim} metalness={0.8} />
        </mesh>
        {/* 握り手 */}
        <mesh castShadow position={[0.03, -0.24, 0.04]}>
          <boxGeometry args={[0.08, 0.06, 0.08]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* 木の杖 (Wizard Energy Staff) */}
        <group position={[0.03, -0.05, 0.14]}>
          {/* 木製長柄シャフト */}
          <mesh castShadow position={[0, -0.12, 0]}>
            <boxGeometry args={[0.032, 0.76, 0.032]} />
            <meshStandardMaterial color={woodStaffColor} roughness={0.8} />
          </mesh>

          {/* 杖先端の木製クレードル（抱き込み枝） */}
          <group position={[0, 0.30, 0]}>
            <mesh castShadow position={[0.03, 0.02, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.02, 0.10, 0.02]} />
              <meshStandardMaterial color={woodStaffColor} roughness={0.8} />
            </mesh>
            <mesh castShadow position={[-0.03, 0.02, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.02, 0.10, 0.02]} />
              <meshStandardMaterial color={woodStaffColor} roughness={0.8} />
            </mesh>
            <mesh castShadow position={[0, 0.02, 0.03]} rotation={[-0.3, 0, 0]}>
              <boxGeometry args={[0.02, 0.10, 0.02]} />
              <meshStandardMaterial color={woodStaffColor} roughness={0.8} />
            </mesh>
            <mesh castShadow position={[0, 0.02, -0.03]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.02, 0.10, 0.02]} />
              <meshStandardMaterial color={woodStaffColor} roughness={0.8} />
            </mesh>

            {/* 青く輝くエナジークリスタル (回転 & 発光パルス) */}
            <mesh ref={crystalRef} position={[0, 0.06, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial
                ref={crystalMatRef}
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={1.2}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>

            {/* 周囲を浮遊する微小エナジーオーブ */}
            <mesh position={[0.06, 0.10, 0]}>
              <boxGeometry args={[0.02, 0.02, 0.02]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={isSpeaking ? 3.0 : 1.5}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* レアリティ共通エフェクト (旋回光粒子・大声ストロボ閃光) */}
      <AvatarRarityEffects
        rarity="epic"
        isSpeaking={isSpeaking}
        isSitting={isSitting}
        voiceVolume={voiceVolume}
        isShouting={isShouting}
        accentColor={accentColor}
      />
    </group>
  );
}
