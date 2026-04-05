import { useVoxelGrid } from '@/hooks/useVoxelGrid';
import { COLORS, DESK_WIDTH, DESK_DEPTH, HEIGHT_DESK, HEIGHT_CHAIR_SEAT, VOXEL_SIZE, GRID_SIZE_X } from '@/constants/voxel';

function Desk({ pos }: { pos: { x: number; y: number; z: number } }) {
  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* 天板 */}
      <mesh castShadow receiveShadow position={[0.5, HEIGHT_DESK / 2, 0]}>
        <boxGeometry args={[DESK_WIDTH, 0.1, DESK_DEPTH]} />
        <meshStandardMaterial color={COLORS.DESK} />
      </mesh>
      {/* 脚 */}
      {[-0.4, 1.4].map((x) => 
        [-0.3, 0.3].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0, z]}>
            <boxGeometry args={[0.1, HEIGHT_DESK, 0.1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        ))
      )}
    </group>
  );
}

function Chair({ pos, rotation = 0 }: { pos: { x: number; y: number; z: number }, rotation?: number }) {
  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      {/* 座面 */}
      <mesh castShadow receiveShadow position={[0, HEIGHT_CHAIR_SEAT / 2, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color={COLORS.CHAIR} />
      </mesh>
      {/* 背もたれ */}
      <mesh castShadow position={[0, HEIGHT_CHAIR_SEAT + 0.3, -0.25]}>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial color={COLORS.CHAIR} />
      </mesh>
      {/* 脚 */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

export function OfficeFurniture() {
  const { getPositionFromSeat } = useVoxelGrid();

  // デスクアイランド (3x2 = 6席)
  // 島を構成する座席のベース座標からのオフセット
  const islandConfig = [
    { xIdx: 3, zIdx: 4, chairRot: 0 },
    { xIdx: 5, zIdx: 4, chairRot: 0 },
    { xIdx: 7, zIdx: 4, chairRot: 0 },
    { xIdx: 3, zIdx: 7, chairRot: Math.PI },
    { xIdx: 5, zIdx: 7, chairRot: Math.PI },
    { xIdx: 7, zIdx: 7, chairRot: Math.PI },
  ];

  return (
    <group>
      {islandConfig.map((conf, i) => {
        const seatIdx = conf.zIdx * GRID_SIZE_X + conf.xIdx;
        const pos = getPositionFromSeat(seatIdx, 0);
        
        // デスクは向かい合わせの間に置く
        const deskZOffset = conf.chairRot === 0 ? 1.0 : -1.0;
        const deskPos = { ...pos, z: pos.z + deskZOffset };

        return (
          <group key={i}>
            <Chair pos={pos} rotation={conf.chairRot} />
            {/* デスクは各列に1つずつ（2マス幅なので飛ばし飛ばしで配置が必要だが、
                ここでは簡略化のため各座席の正面に置く。重なる部分は重複描画されるが
                静的なので一旦許容。本来は i < 3 の時だけ描画等で制御すべき） */}
            { i % 3 === 0 && <Desk pos={{ ...deskPos, x: deskPos.x + 0.5 }} /> }
          </group>
        );
      })}
    </group>
  );
}
