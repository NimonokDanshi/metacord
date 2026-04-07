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
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* 腕 (Arms) */}
      {/* 右腕 */}
      <mesh castShadow position={[0.25, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 左腕 */}
      <mesh castShadow position={[-0.25, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 足 (Legs) - 座居ポーズ (L字) の制御 */}
      {isSitting ? (
        <group position={[0, 0.05, 0.15]}>
          {/* 右足 (座り: 前に突き出す) */}
          <mesh castShadow position={[0.1, 0, 0.15]}>
            <boxGeometry args={[0.12, 0.1, 0.35]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* 左足 (座り: 前に突き出す) */}
          <mesh castShadow position={[-0.1, 0, 0.15]}>
            <boxGeometry args={[0.12, 0.1, 0.35]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ) : (
        <group position={[0, 0.05, 0]}>
          {/* 右足 (立ち) */}
          <mesh castShadow position={[0.1, -0.2, 0]}>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* 左足 (立ち) */}
          <mesh castShadow position={[-0.1, -0.2, 0]}>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )}
    </group>
  );
}
