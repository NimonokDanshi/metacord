import React from 'react';
import { COLORS, HEIGHT_CHAIR_SEAT } from '@/constants/voxel';

interface Props {
  pos?: { x: number; y: number; z: number };
  rotation?: number;
}

export function JapandiChair({ pos = { x: 0, y: 0, z: 0 }, rotation = 0 }: Props) {
  const seatThickness = 0.1;
  const backrestHeight = 0.45;

  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      {/* 座面 (ファブリック/ベージュ) */}
      <mesh castShadow receiveShadow position={[0, HEIGHT_CHAIR_SEAT - seatThickness / 2, 0]}>
        <boxGeometry args={[0.5, seatThickness, 0.5]} />
        <meshStandardMaterial color={COLORS.JAPANDI_BEIGE} />
      </mesh>
      
      {/* 背もたれ (オーク材) */}
      <mesh castShadow position={[0, HEIGHT_CHAIR_SEAT + backrestHeight / 2, -0.22]}>
        <boxGeometry args={[0.45, backrestHeight, 0.06]} />
        <meshStandardMaterial color={COLORS.JAPANDI_WOOD} />
      </mesh>

      {/* 脚 (4本脚スタイル、オーク材) */}
      {[
        [0.2, 0, 0.2], [-0.2, 0, 0.2],
        [0.2, 0, -0.2], [-0.2, 0, -0.2]
      ].map((p, i) => (
        <mesh key={i} castShadow position={[p[0], (HEIGHT_CHAIR_SEAT - 0.1) / 2, p[2]]}>
          <boxGeometry args={[0.06, HEIGHT_CHAIR_SEAT - 0.1, 0.06]} />
          <meshStandardMaterial color={COLORS.JAPANDI_WOOD} />
        </mesh>
      ))}
    </group>
  );
}
