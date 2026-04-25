import React from 'react';
import { COLORS, HEIGHT_CHAIR_SEAT } from '@/constants/voxel';

export function Chair({ pos = { x: 0, y: 0, z: 0 }, rotation = 0 }: { pos?: { x: number; y: number; z: number }, rotation?: number }) {
  const seatThickness = 0.08;
  const baseHeight = 0.05;
  const stemHeight = HEIGHT_CHAIR_SEAT - seatThickness - baseHeight;

  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      {/* 座面 */}
      <mesh castShadow receiveShadow position={[0, HEIGHT_CHAIR_SEAT - seatThickness / 2, 0]}>
        <boxGeometry args={[0.55, seatThickness, 0.55]} />
        <meshStandardMaterial color={COLORS.CHAIR} />
      </mesh>
      
      {/* 背もたれ */}
      <mesh castShadow position={[0, HEIGHT_CHAIR_SEAT + 0.3, -0.22]}>
        <boxGeometry args={[0.5, 0.55, 0.08]} />
        <meshStandardMaterial color={COLORS.CHAIR} />
      </mesh>

      {/* 支柱 (Stem) */}
      <mesh castShadow position={[0, baseHeight + stemHeight / 2, 0]}>
        <boxGeometry args={[0.08, stemHeight, 0.08]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* ベース (Legs Base) */}
      {[0, Math.PI / 2].map((rot, i) => (
        <mesh key={i} castShadow position={[0, baseHeight / 2 + 0.05, 0]} rotation={[0, rot, 0]}>
          <boxGeometry args={[0.5, baseHeight, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* キャスター (Casters) */}
      {[
        [0.22, 0.04, 0], [-0.22, 0.04, 0],
        [0, 0.04, 0.22], [0, 0.04, -0.22]
      ].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
    </group>
  );
}
