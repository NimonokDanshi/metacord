import React from 'react';
import { COLORS } from '@/constants/voxel';

interface Props {
  color?: string;
  isSitting?: boolean;
}

/**
 * CatModel
 * ネコ型のアバターモデル (4足歩行バージョン)。
 */
export function CatModel({
  color = COLORS.CAT_GREY,
}: Props) {
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
        <mesh name="Ear_L" castShadow position={[-0.12, 0.2, -0.05]}>
          <boxGeometry args={[0.08, 0.1, 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh name="Ear_R" castShadow position={[0.12, 0.2, -0.05]}>
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

      {/* 4本の足 (4 Legs) */}
      {/* 前足 */}
      <mesh name="Leg_Front_R" castShadow position={[0.15, 0.05, 0.1]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh name="Leg_Front_L" castShadow position={[-0.15, 0.05, 0.1]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
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
      <mesh name="Tail" castShadow position={[0, 0.4, -0.35]} rotation={[0.8, 0, 0]}>
        <boxGeometry args={[0.05, 0.35, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
