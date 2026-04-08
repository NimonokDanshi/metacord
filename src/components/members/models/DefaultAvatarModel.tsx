import React from 'react';
import { COLORS } from '@/constants/voxel';

interface Props {
  color?: string;
  skinColor?: string;
  isSitting?: boolean;
}

export function DefaultAvatarModel({
  color = COLORS.AVATAR_BLUE,
  skinColor = COLORS.AVATAR_SKIN,
  isSitting = true
}: Props) {
  return (
    <group>
      {/* 胴体 (Body) */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 頭 (Head) - 胴体から少し浮いた位置 */}
      <mesh name="Head" castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* 目 (Eyes) */}
      <group name="Eyes">
        {/* 白目 */}
        <mesh name="EyeWhite_R" castShadow position={[0.08, 0.75, 0.14]} scale={[1.25, 1.8, 1]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
        </mesh>
        <mesh name="EyeWhite_L" castShadow position={[-0.08, 0.75, 0.14]} scale={[1.25, 1.8, 1]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
        </mesh>
        {/* 黒目 */}
        <mesh name="Pupil_R" castShadow position={[0.08, 0.75, 0.16]} scale={[1.6, 1.6, 1]}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
        </mesh>
        <mesh name="Pupil_L" castShadow position={[-0.08, 0.75, 0.16]} scale={[1.6, 1.6, 1]}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
        </mesh>
      </group>

      {/* 腕 (Arms) */}
      <mesh name="Arm_R" castShadow position={[0.25, 0.45, 0.15]} rotation={[-1.6, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh name="Arm_L" castShadow position={[-0.25, 0.45, 0.15]} rotation={[-1.6, 0, 0]}>
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
