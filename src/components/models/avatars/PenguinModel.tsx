import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/constants/voxel';
import { AvatarModelProps } from '@/types/avatar';

/**
 * PenguinModel (Rare)
 * ペンギン型のアバターモデル
 * - 喋っている間 (isSpeaking): 両翼（フリッパー）を嬉しそうにパタパタ羽ばたかせる
 * - 大声時 (isShouting): 【頭（首）が360度ギュルルルン超高速スピン回転！】
 */
export function PenguinModel({
  color = COLORS.PENGUIN_BLACK,
  isSitting = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: AvatarModelProps) {
  const headGroupRef = useRef<THREE.Group>(null);
  const flipperRRef = useRef<THREE.Group>(null);
  const flipperLRef = useRef<THREE.Group>(null);

  const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.5);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (isSpeaking) {
      // 1. 翼パタパタ (大声時は超高速羽ばたき)
      const flap = Math.sin(t * (isOverdrive ? 24 : 14)) * (isOverdrive ? 0.6 : 0.35);
      if (flipperRRef.current) flipperRRef.current.rotation.z = -flap;
      if (flipperLRef.current) flipperLRef.current.rotation.z = flap;

      // 2. ★ 首（頭）が360度超高速スピン回転！
      if (headGroupRef.current) {
        if (isOverdrive) {
          headGroupRef.current.rotation.y = (t * 24) % (Math.PI * 2);
        } else {
          headGroupRef.current.rotation.y = Math.sin(t * 8) * 0.12;
        }
      }
    } else {
      if (flipperRRef.current) flipperRRef.current.rotation.z = 0;
      if (flipperLRef.current) flipperLRef.current.rotation.z = 0;
      if (headGroupRef.current) headGroupRef.current.rotation.y = 0;
    }
  });

  return (
    <group>
      {/* 胴体 */}
      <mesh name="Body" castShadow position={[0, 0.4, 0]} scale={[0.85, 1.6, 1]}>
        <boxGeometry args={[0.45, 0.5, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* お腹 */}
      <mesh name="Belly" castShadow position={[0, 0.3, 0.16]} scale={[0.7, 1, 1]}>
        <boxGeometry args={[0.35, 0.4, 0.05]} />
        <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
      </mesh>

      {/* 頭部グループ (首回転連動) */}
      <group ref={headGroupRef} position={[0, 0.6, 0]}>
        {/* 頭頂部 */}
        <mesh name="HeadTop" castShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[0.32, 0.18, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* くちばし */}
        <mesh name="Beak" castShadow position={[0, 0, 0.18]} scale={[1, 0.75, 1]}>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} />
        </mesh>

        {/* 目 (Eyes) */}
        <group name="Eyes" position={[0, 0.08, 0]}>
          {/* 白目 */}
          <mesh name="EyeWhite_R" castShadow position={[0.08, 0.02, 0.16]} scale={[1.25, 1.8, 1]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
          </mesh>
          <mesh name="EyeWhite_L" castShadow position={[-0.08, 0.02, 0.16]} scale={[1.25, 1.8, 1]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
          </mesh>
          {/* 黒目 */}
          <mesh name="Pupil_R" castShadow position={[0.08, 0.02, 0.18]} scale={[1.6, 1.6, 1]}>
            <boxGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
          </mesh>
          <mesh name="Pupil_L" castShadow position={[-0.08, 0.02, 0.18]} scale={[1.6, 1.6, 1]}>
            <boxGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
          </mesh>
        </group>
      </group>

      {/* 羽 (Flippers) - ピボットを肩に設定してパタパタ羽ばたき */}
      <group ref={flipperRRef} position={[0.22, 0.55, 0.05]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.08, 0.35, 0.16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <group ref={flipperLRef} position={[-0.22, 0.55, 0.05]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.08, 0.35, 0.16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* 足 (Feet) */}
      {isSitting ? (
        <group name="Feet_Sitting" position={[0, 0.05, 0.15]}>
          <mesh
            name="Foot_R"
            castShadow
            position={[0.1, 0.1, 0.1]}
            rotation={[-1.4, 0, 0]}
          >
            <boxGeometry args={[0.15, 0.06, 0.3]} />
            <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} />
          </mesh>
          <mesh
            name="Foot_L"
            castShadow
            position={[-0.1, 0.1, 0.1]}
            rotation={[-1.4, 0, 0]}
          >
            <boxGeometry args={[0.15, 0.06, 0.3]} />
            <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} />
          </mesh>
        </group>
      ) : (
        <group name="Feet_Standing" position={[0, 0.03, 0]}>
          <mesh name="Foot_R" castShadow position={[0.1, 0, 0.05]}>
            <boxGeometry args={[0.15, 0.06, 0.25]} />
            <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} />
          </mesh>
          <mesh name="Foot_L" castShadow position={[-0.1, 0, 0.05]}>
            <boxGeometry args={[0.15, 0.06, 0.25]} />
            <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} />
          </mesh>
        </group>
      )}
    </group>
  );
}
