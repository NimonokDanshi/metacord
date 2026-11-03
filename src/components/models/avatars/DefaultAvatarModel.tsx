import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/constants/voxel';
import { AvatarModelProps } from '@/types/avatar';

/**
 * DefaultAvatarModel (Standard Bot)
 * クラシックなボクセルロボットアバター
 * - 発言時 (isSpeaking): 腕をピコピコ振り、目がピカッと発光
 * - 大声シャウト時 (isShouting):
 *   ①【頭が360度超高速回転（ギュルルルン！）】
 *   ②【両目から前方に真っ赤なツインレーザービーム大照射！】
 */
export function DefaultAvatarModel({
  color = COLORS.AVATAR_BLUE,
  skinColor = COLORS.AVATAR_SKIN,
  isSitting = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: AvatarModelProps) {
  const headGroupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const laserBeamRRef = useRef<THREE.Mesh>(null);
  const laserBeamLRef = useRef<THREE.Mesh>(null);

  const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.5);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (isSpeaking) {
      // 腕のピコピコ動作
      const armSwing = Math.sin(t * (isOverdrive ? 24 : 14)) * (isOverdrive ? 0.6 : 0.35);
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.6 + armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.6 - armSwing;

      // 頭の回転: 大声時はギュルルルンと360度超高速スピン！
      if (headGroupRef.current) {
        if (isOverdrive) {
          headGroupRef.current.rotation.y = (t * 26) % (Math.PI * 2);
        } else {
          // 通常発言時は少しキョロキョロ
          headGroupRef.current.rotation.y = Math.sin(t * 8) * 0.15;
        }
      }

      // 目からビーム！大声時は極太レーザーが前方に大照射！
      if (laserBeamRRef.current && laserBeamLRef.current) {
        if (isOverdrive) {
          const beamLen = 2.2 + Math.sin(t * 30) * 0.3;
          laserBeamRRef.current.scale.set(1.5, 1.5, beamLen);
          laserBeamLRef.current.scale.set(1.5, 1.5, beamLen);
          (laserBeamRRef.current.material as THREE.MeshBasicMaterial).opacity = 0.95;
          (laserBeamLRef.current.material as THREE.MeshBasicMaterial).opacity = 0.95;
        } else {
          laserBeamRRef.current.scale.set(0, 0, 0);
          laserBeamLRef.current.scale.set(0, 0, 0);
        }
      }
    } else {
      // 待機時の定位置
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.6;
      if (headGroupRef.current) headGroupRef.current.rotation.y = 0;
      if (laserBeamRRef.current && laserBeamLRef.current) {
        laserBeamRRef.current.scale.set(0, 0, 0);
        laserBeamLRef.current.scale.set(0, 0, 0);
      }
    }
  });

  return (
    <group>
      {/* 胴体 (Body) */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 頭部グループ (頭本体 + 目 + 目からビーム) */}
      <group ref={headGroupRef} position={[0, 0.65, 0]}>
        {/* 頭本体 */}
        <mesh name="Head" castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* 目 (Eyes) */}
        <group name="Eyes">
          {/* 白目 */}
          <mesh name="EyeWhite_R" castShadow position={[0.08, 0.05, 0.14]} scale={[1.25, 1.8, 1]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
          </mesh>
          <mesh name="EyeWhite_L" castShadow position={[-0.08, 0.05, 0.14]} scale={[1.25, 1.8, 1]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
          </mesh>
          {/* 黒目 (大声時は赤熱レーザーアイに変化！) */}
          <mesh name="Pupil_R" castShadow position={[0.08, 0.05, 0.16]} scale={[1.6, 1.6, 1]}>
            <boxGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial
              color={isOverdrive ? '#ff0033' : COLORS.PENGUIN_BLACK}
              emissive={isOverdrive ? '#ff0033' : '#000000'}
              emissiveIntensity={isOverdrive ? 4.0 : 0}
            />
          </mesh>
          <mesh name="Pupil_L" castShadow position={[-0.08, 0.05, 0.16]} scale={[1.6, 1.6, 1]}>
            <boxGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial
              color={isOverdrive ? '#ff0033' : COLORS.PENGUIN_BLACK}
              emissive={isOverdrive ? '#ff0033' : '#000000'}
              emissiveIntensity={isOverdrive ? 4.0 : 0}
            />
          </mesh>

          {/* ★ 目からビーム (右目＆左目から前方に照射されるレーザー) */}
          <mesh ref={laserBeamRRef} position={[0.08, 0.05, 0.9]} scale={[0, 0, 0]}>
            <boxGeometry args={[0.035, 0.035, 1.5]} />
            <meshBasicMaterial color="#ff0033" transparent opacity={0.95} />
          </mesh>
          <mesh ref={laserBeamLRef} position={[-0.08, 0.05, 0.9]} scale={[0, 0, 0]}>
            <boxGeometry args={[0.035, 0.035, 1.5]} />
            <meshBasicMaterial color="#ff0033" transparent opacity={0.95} />
          </mesh>
        </group>
      </group>

      {/* 腕 (Arms) */}
      <mesh ref={rightArmRef} name="Arm_R" castShadow position={[0.25, 0.4, 0.15]} rotation={[-1.6, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={leftArmRef} name="Arm_L" castShadow position={[-0.25, 0.4, 0.15]} rotation={[-1.6, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 足 (Legs) */}
      {isSitting ? (
        <group name="Legs_Sitting" position={[0, 0.05, 0.15]}>
          <mesh name="Leg_R" castShadow position={[0.1, 0, 0.15]}>
            <boxGeometry args={[0.12, 0.1, 0.35]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh name="Leg_L" castShadow position={[-0.1, 0, 0.15]}>
            <boxGeometry args={[0.12, 0.1, 0.35]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ) : (
        <group name="Legs_Standing" position={[0, 0.05, 0]}>
          <mesh name="Leg_R" castShadow position={[0.1, -0.2, 0]}>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh name="Leg_L" castShadow position={[-0.1, -0.2, 0]}>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )}
    </group>
  );
}
