import { useRoomStore } from '@/stores/roomStore';
import { useVoxelGrid } from '@/utils/voxelGrid';
import { ROOM_ITEMS } from '@/constants/roomItems';
import { DynamicFurniture } from '@/components/office/DynamicFurniture';
import { COLORS, DESK_DEPTH, HEIGHT_DESK, HEIGHT_CHAIR_SEAT } from '@/constants/voxel';
import { Monitor, PCCase, Keyboard, Mouse } from './OfficeEquipment';

export function Desk({ pos }: { pos: { x: number; y: number; z: number } }) {
  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* 天板 (センター配置) */}
      <mesh castShadow receiveShadow position={[0, HEIGHT_DESK - 0.05, 0]}>
        <boxGeometry args={[1.98, 0.1, DESK_DEPTH]} />
        <meshStandardMaterial color={COLORS.DESK} />
      </mesh>
      {/* 脚 (センター基準) */}
      {[-0.8, 0.8].map((x) => 
        [-0.3, 0.3].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, (HEIGHT_DESK - 0.1) / 2, z]}>
            <boxGeometry args={[0.08, HEIGHT_DESK - 0.1, 0.08]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        ))
      )}
    </group>
  );
}

export function Workstation({ pos, rotation = 0 }: { pos: { x: number; y: number; z: number }, rotation?: number }) {
  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      <Desk pos={{ x: 0, y: 0, z: 0 }} />
      {/* セットの椅子 */}
      <Chair pos={{ x: 0.5, y: 0, z: 1.25 }} rotation={Math.PI} />
      {/* 卓上機材 (センター基準) */}
      <group position={[0, HEIGHT_DESK, 0]}>
        <Monitor />
        <group position={[0, 0, 0.25]}>
          <Keyboard />
        </group>
        <group position={[0.35, 0.015, 0.25]}>
          <Mouse />
        </group>
        <group position={[0.6, 0.225, -0.05]}>
          <PCCase />
        </group>
      </group>
    </group>
  );
}

export function Chair({ pos, rotation = 0 }: { pos: { x: number; y: number; z: number }, rotation?: number }) {
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

/**
 * カスタムデスクモデル (着席時に表示される豪華版)
 */
export function CustomWorkstation({ pos, rotation = 0 }: { pos: { x: number; y: number; z: number }, rotation?: number }) {
  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      <Desk pos={{ x: 0, y: 0, z: 0 }} />
      {/* セットの椅子 */}
      <Chair pos={{ x: 0.5, y: 0, z: 1.25 }} rotation={Math.PI} />
      {/* 卓上機材 (2枚のモニター等) */}
      <group position={[0, HEIGHT_DESK, 0]}>
        <group position={[-0.4, 0, 0]} rotation={[0, 0.2, 0]}>
          <Monitor />
        </group>
        <group position={[0.4, 0, 0]} rotation={[0, -0.2, 0]}>
          <Monitor />
        </group>
        <group position={[0, 0, 0.25]}>
          <Keyboard />
        </group>
        <group position={[0.35, 0.015, 0.25]}>
          <Mouse />
        </group>
        <group position={[0.7, 0.225, -0.05]}>
          <PCCase />
        </group>
      </group>
    </group>
  );
}


/**
 * サーバーに配置された家具を動的に描画するコンポーネント
 */
export function OfficeFurniture() {
  const { furnitures } = useRoomStore();
  const { getWorldFromGrid } = useVoxelGrid();

  console.log('[OfficeFurniture] Rendering furnitures:', furnitures);

  return (
    <group>
      {furnitures
        .filter(f => f.id !== useRoomStore.getState().movingFurnitureId)
        .map((f) => {
          const item = ROOM_ITEMS.find((it) => it.id === f.item_id);
        if (!item) {
          console.warn(`[OfficeFurniture] Item not found: ${f.item_id}`);
          return null;
        }

        const worldPos = getWorldFromGrid(f.pos_x, f.pos_z);

        return (
          <group key={f.id} position={[worldPos.x, worldPos.y, worldPos.z]}>
            <DynamicFurniture 
              id={f.id}
              item={item} 
              rotation={f.rotation} 
              gridX={f.pos_x} 
              gridZ={f.pos_z} 
            />
          </group>
        );
      })}
    </group>
  );
}
