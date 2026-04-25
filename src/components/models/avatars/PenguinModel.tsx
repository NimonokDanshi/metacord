import React from 'react';
import { COLORS } from '@/constants/voxel';

interface Props {
  color?: string;
  isSitting?: boolean;
}

/**
 * PenguinModel
 * ペンギン型のアバターモデル。
 * Triplexでの視覚的編集を優先するため、単一コンポーネント構造に統合。
 */
export function PenguinModel({
  color = COLORS.PENGUIN_BLACK,
  isSitting = false
}: Props) {
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

      {/* くちばし */}
      <mesh name="Beak" castShadow position={[0, 0.6, 0.18]} scale={[1, 0.75, 1]}>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color={COLORS.PENGUIN_YELLOW} />
      </mesh>

      {/* 目 (Eyes) */}
      <group name="Eyes">
        {/* 白目 */}
        <mesh name="EyeWhite_R" castShadow position={[0.08, 0.7, 0.16]} scale={[1.25, 1.8, 1]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
        </mesh>
        <mesh name="EyeWhite_L" castShadow position={[-0.08, 0.7, 0.16]} scale={[1.25, 1.8, 1]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color={COLORS.PENGUIN_WHITE} />
        </mesh>
        {/* 黒目 */}
        <mesh name="Pupil_R" castShadow position={[0.08, 0.7, 0.18]} scale={[1.6, 1.6, 1]}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
        </mesh>
        <mesh name="Pupil_L" castShadow position={[-0.08, 0.7, 0.18]} scale={[1.6, 1.6, 1]}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshStandardMaterial color={COLORS.PENGUIN_BLACK} />
        </mesh>
      </group>

      {/* 羽 (Flippers) */}
      <mesh
        name="Flipper_R"
        castShadow
        position={[0.22, 0.45, 0.15]}
        rotation={[-1.57, 0, 0]}
      >
        <boxGeometry args={[0.08, 0.35, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh
        name="Flipper_L"
        castShadow
        position={[-0.22, 0.45, 0.15]}
        rotation={[-1.57, 0, 0]}
      >
        <boxGeometry args={[0.08, 0.35, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

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
