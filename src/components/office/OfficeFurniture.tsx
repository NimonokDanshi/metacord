import React from 'react';
import { useVoxelGrid } from '@/hooks/useVoxelGrid';
import { COLORS } from '@/constants/voxel';

function Desk({ seatIndex }: { seatIndex: number }) {
  const { getPositionFromSeat } = useVoxelGrid();
  const pos = getPositionFromSeat(seatIndex, 0.4);

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* 天板 */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.7]} />
        <meshStandardMaterial color={COLORS.DESK} />
      </mesh>
      {/* 脚 (簡易) */}
      <mesh castShadow position={[-0.4, -0.2, -0.3]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh castShadow position={[0.4, -0.2, -0.3]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function Chair({ seatIndex }: { seatIndex: number }) {
  const { getPositionFromSeat } = useVoxelGrid();
  const pos = getPositionFromSeat(seatIndex, 0.2);

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color={COLORS.CHAIR} />
      </mesh>
      <mesh castShadow position={[0, 0.3, -0.2]}>
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color={COLORS.CHAIR} />
      </mesh>
    </group>
  );
}

export function OfficeFurniture() {
  // 適当な位置に家具を配置 (12x12 grid)
  const deskSeats = [14, 16, 18, 38, 40, 42, 62, 64, 66];
  const chairSeats = [26, 28, 30, 50, 52, 54, 74, 76, 78];

  return (
    <group>
      {deskSeats.map(s => <Desk key={`d-${s}`} seatIndex={s} />)}
      {chairSeats.map(s => <Chair key={`c-${s}`} seatIndex={s} />)}
    </group>
  );
}
