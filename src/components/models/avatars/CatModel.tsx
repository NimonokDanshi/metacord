import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/constants/voxel';
import { AvatarModelProps } from '@/types/avatar';

/**
 * CatModel (Rare)
 * ネコ型のアバターモデル (4足歩行バージョン)
 * - 喋っている間 (isSpeaking): 耳がピクピク動き、しっぽが優雅に左右フリフリ
 * - 大声時 (isShouting): 【超高速猫パンチ（前足を交互に高速シュッシュッ猛連打！）】
 */
export function CatModel({
  color = COLORS.CAT_GREY,
  isSitting = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: AvatarModelProps) {
  const leftEarRef = useRef<THREE.Mesh>(null);
  const rightEarRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const frontPawRRef = useRef<THREE.Group>(null);
  const frontPawLRef = useRef<THREE.Group>(null);

  const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.5);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (isSpeaking) {
      // 1. 耳のピクピク
      const earTwitch = Math.sin(t * (isOverdrive ? 26 : 14)) * 0.18;
      if (leftEarRef.current) leftEarRef.current.rotation.z = earTwitch;
      if (rightEarRef.current) rightEarRef.current.rotation.z = -earTwitch;

      // 2. 尻尾のフリフリ（大声時は高速うねり）
      if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(t * (isOverdrive ? 18 : 10)) * (isOverdrive ? 0.45 : 0.25);
      }

      // 3. ★ 超高速猫パンチ（大声時: 前足を交互に前へシュッシュッ猛連打！）
      if (frontPawRRef.current && frontPawLRef.current) {
        if (isOverdrive) {
          const punchFreq = 28;
          const punchR = Math.sin(t * punchFreq) * 0.5;
          const punchL = Math.sin(t * punchFreq + Math.PI) * 0.5;
          frontPawRRef.current.rotation.x = -0.4 + punchR;
          frontPawLRef.current.rotation.x = -0.4 + punchL;
        } else {
          frontPawRRef.current.rotation.x = 0;
          frontPawLRef.current.rotation.x = 0;
        }
      }
    } else {
      if (leftEarRef.current) leftEarRef.current.rotation.z = 0;
      if (rightEarRef.current) rightEarRef.current.rotation.z = 0;
      if (tailRef.current) tailRef.current.rotation.y = 0;
      if (frontPawRRef.current) frontPawRRef.current.rotation.x = 0;
      if (frontPawLRef.current) frontPawLRef.current.rotation.x = 0;
    }
  });

  return (
    <group>
      {/* 胴体 (Body) - 横長に設定 */}
      <mesh name="Body" castShadow position={[0, 0.275, -0.1]}>
        <boxGeometry args={[0.4, 0.35, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 頭 (Head) - 前方に配置 */}
      <group position={[0, 0.33, 0.25]}>
        <mesh name="Head" castShadow>
          <boxGeometry args={[0.35, 0.3, 0.25]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* 耳 (Ears) */}
        <mesh ref={leftEarRef} name="Ear_L" castShadow position={[-0.12, 0.2, -0.05]}>
          <boxGeometry args={[0.08, 0.1, 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh ref={rightEarRef} name="Ear_R" castShadow position={[0.12, 0.2, -0.05]}>
          <boxGeometry args={[0.08, 0.1, 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* 耳の内側 (Pink) */}
        <mesh position={[-0.12, 0.18, -0.02]}>
          <boxGeometry args={[0.04, 0.05, 0.01]} />
          <meshStandardMaterial color={COLORS.CAT_PINK} />
        </mesh>
        <mesh position={[0.12, 0.18, -0.02]}>
          <boxGeometry args={[0.04, 0.05, 0.01]} />
          <meshStandardMaterial color={COLORS.CAT_PINK} />
        </mesh>

        {/* 鼻 (Nose) */}
        <mesh name="Nose" castShadow position={[0, -0.02, 0.13]}>
          <boxGeometry args={[0.05, 0.04, 0.02]} />
          <meshStandardMaterial color={COLORS.CAT_PINK} />
        </mesh>

        {/* ひげ (Whiskers) */}
        <group name="Whiskers" position={[0, -0.05, 0.13]}>
          {/* 右側 */}
          <mesh position={[0.18, 0.03, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[0.12, 0.01, 0.01]} />
            <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
          </mesh>
          <mesh position={[0.18, -0.03, 0]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[0.12, 0.01, 0.01]} />
            <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
          </mesh>
          {/* 左側 */}
          <mesh position={[-0.18, 0.03, 0]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[0.12, 0.01, 0.01]} />
            <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
          </mesh>
          <mesh position={[-0.18, -0.03, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[0.12, 0.01, 0.01]} />
            <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
          </mesh>
        </group>

        {/* 目 (Eyes) */}
        <group name="Eyes">
          <mesh name="Pupil_R" castShadow position={[0.06, 0.05, 0.12]}>
            <boxGeometry args={[0.03, 0.06, 0.02]} />
            <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
          </mesh>
          <mesh name="Pupil_L" castShadow position={[-0.06, 0.05, 0.12]}>
            <boxGeometry args={[0.03, 0.06, 0.02]} />
            <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
          </mesh>
        </group>
      </group>

      {/* 4本の足 (4 Legs) - 前足は肩ピボットで猫パンチ！ */}
      <group ref={frontPawRRef} position={[0.15, 0.12, 0.1]}>
        <mesh castShadow position={[0, -0.07, 0]}>
          <boxGeometry args={[0.1, 0.15, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <group ref={frontPawLRef} position={[-0.15, 0.12, 0.1]}>
        <mesh castShadow position={[0, -0.07, 0]}>
          <boxGeometry args={[0.1, 0.15, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* 後ろ足 */}
      <mesh name="Leg_Back_R" castShadow position={[0.15, 0.05, -0.3]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh name="Leg_Back_L" castShadow position={[-0.15, 0.05, -0.3]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 尻尾 (Tail) - 上向きにピンと立てる */}
      <mesh ref={tailRef} name="Tail" castShadow position={[0, 0.4, -0.35]} rotation={[0.8, 0, 0]}>
        <boxGeometry args={[0.05, 0.35, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
