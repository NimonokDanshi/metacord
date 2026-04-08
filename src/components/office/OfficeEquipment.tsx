import React from 'react';
import { COLORS } from '@/constants/voxel';

/**
 * モニター
 */
export function Monitor() {
  return (
    <group>
      {/* 台座 */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 支柱 */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 画面本体 */}
      <mesh castShadow position={[0, 0.25, 0.02]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.03]} />
        <meshStandardMaterial color={COLORS.MONITOR} />
      </mesh>
      {/* 画面 (発光面) */}
      <mesh position={[0, 0.25, 0.036]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.56, 0.31, 0.001]} />
        <meshStandardMaterial color="#444" emissive="#111" />
      </mesh>
    </group>
  );
}

/**
 * PC本体 (デスクトップ筐体)
 */
export function PCCase() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.2, 0.45, 0.4]} />
      <meshStandardMaterial color={COLORS.PC_CASE} />
    </mesh>
  );
}

/**
 * キーボード
 */
export function Keyboard() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.4, 0.02, 0.15]} />
      <meshStandardMaterial color={COLORS.KEYBOARD} />
    </mesh>
  );
}

/**
 * マウス
 */
export function Mouse() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.06, 0.03, 0.1]} />
      <meshStandardMaterial color={COLORS.MOUSE} />
    </mesh>
  );
}

/**
 * 観葉植物
 */
export function PottedPlant() {
  return (
    <group>
      {/* 鉢 */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color={COLORS.POT} />
      </mesh>
      {/* 土 */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.25, 0.05, 0.25]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      {/* 葉 (ボクセル風の積み上げ) */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={COLORS.PLANT} />
      </mesh>
      <mesh castShadow position={[0.1, 0.6, -0.05]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={COLORS.PLANT} />
      </mesh>
      <mesh castShadow position={[-0.05, 0.7, 0.1]}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color={COLORS.PLANT} />
      </mesh>
    </group>
  );
}
