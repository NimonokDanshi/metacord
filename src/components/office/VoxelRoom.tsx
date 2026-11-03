import React from 'react';
import { GRID_SIZE_X, GRID_SIZE_Z, VOXEL_SIZE } from '@/constants/voxel';
import { MetaCordLogo } from '@/components/models/parts/MetaCordLogo';
import { useDiscordStore } from '@/stores/discordStore';
import { useRoomStore } from '@/stores/roomStore';
import { roomActions } from '@/actions/roomActions';
import { ROOM_ITEMS } from '@/constants/roomItems';

/**
 * VoxelRoom (スターターオフィス)
 * 清潔感があり落ち着いた初期ルーム。
 * 主張しすぎず、家具やアバターが最も映えるニュートラルなオフィス空間を提供し、
 * 今後の壁紙・床の着せ替え意欲を引き出す「洗練された余白」を持たせています。
 */
export function VoxelRoom() {
  const speakingUserIds = useDiscordStore((s) => s.speakingUserIds);
  const isAnyoneSpeaking = speakingUserIds.size > 0;
  const { isEditing, furnitures } = useRoomStore();

  // 家具が配置されているマス（当たり判定）をセットアップ
  const occupiedGridCells = React.useMemo(() => {
    const set = new Set<string>();
    furnitures.forEach(f => {
      const item = ROOM_ITEMS.find(it => it.id === f.item_id);
      const sX = item?.sizeX ?? 1;
      const sZ = item?.sizeZ ?? 1;
      for (let dx = 0; dx < sX; dx++) {
        for (let dz = 0; dz < sZ; dz++) {
          set.add(`${f.pos_x + dx}-${f.pos_z + dz}`);
        }
      }
    });
    return set;
  }, [furnitures]);

  const handleTileClick = (x: number, z: number, e: any) => {
    if (isEditing) return;
    // 家具が上に置かれているマスは家具のクリックに任せる
    if (occupiedGridCells.has(`${x}-${z}`)) return;

    e.stopPropagation();
    const targetSeatIdx = z * GRID_SIZE_X + x;
    console.log('[VoxelRoom] Floor clicked, moving to seat:', targetSeatIdx);
    roomActions.changeSeat(targetSeatIdx, null);
  };

  const tiles = [];

  // 落ち着いたチャコールグレーのカーペットフロア (目に優しく家具が映える)
  const floorTileColor = '#242b35';
  const floorSubtleColor = '#202630';

  for (let z = 0; z < GRID_SIZE_Z; z++) {
    for (let x = 0; x < GRID_SIZE_X; x++) {
      // わずかな濃淡でタイル目地を表現 (チカチカしない品の良いトーン)
      const isSubtle = (x + z) % 2 === 0;
      const color = isSubtle ? floorTileColor : floorSubtleColor;

      const posX = x * VOXEL_SIZE - (GRID_SIZE_X * VOXEL_SIZE) / 2 + VOXEL_SIZE / 2;
      const posZ = z * VOXEL_SIZE - (GRID_SIZE_Z * VOXEL_SIZE) / 2 + VOXEL_SIZE / 2;

      tiles.push(
        <mesh
          key={`${x}-${z}`}
          position={[posX, -0.05, posZ]}
          receiveShadow
          onClick={(e) => handleTileClick(x, z, e)}
        >
          <boxGeometry args={[VOXEL_SIZE * 0.98, 0.1, VOXEL_SIZE * 0.98]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      );
    }
  }

  const offset = (GRID_SIZE_X * VOXEL_SIZE) / 2;
  const wallHeight = 3.2;

  // 清潔感のあるライトスレート壁 ＆ ダーク巾木
  const wallColor = '#e2e8f0';     // 明るいオフィスライトグレー
  const baseboardColor = '#334155'; // 引き締め巾木
  const trimColor = '#64748b';      // トップトリム

  return (
    <group>
      {/* 1. 床タイル群 */}
      {tiles}

      {/* 床の外周ベースフレーム (部屋の輪郭を引き締める) */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[GRID_SIZE_X * VOXEL_SIZE + 0.15, 0.08, GRID_SIZE_Z * VOXEL_SIZE + 0.15]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* 2. 壁面 (L字レイアウト: 左壁 -X ＆ 奥壁 -Z) */}

      {/* --- 奥壁 (-Z側メイン壁) --- */}
      <group position={[0, 0, -offset - 0.1]}>
        {/* メイン壁パネル */}
        <mesh position={[0, wallHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[GRID_SIZE_X, wallHeight, 0.18]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
        </mesh>

        {/* 足元の巾木 (ベースボード) */}
        <mesh position={[0, 0.08, 0.02]} receiveShadow>
          <boxGeometry args={[GRID_SIZE_X, 0.16, 0.16]} />
          <meshStandardMaterial color={baseboardColor} roughness={0.7} />
        </mesh>

        {/* 上部のトップトリム */}
        <mesh position={[0, wallHeight, 0.02]}>
          <boxGeometry args={[GRID_SIZE_X, 0.08, 0.16]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} />
        </mesh>

        {/* 奥壁中央の MetaCord ロゴプレート (品良く配置) */}
        <MetaCordLogo
          position={[0, 1.85, 0.11]}
          scale={0.95}
          isSpeaking={isAnyoneSpeaking}
        />
      </group>

      {/* --- 左壁 (-X側サイド壁) --- */}
      <group position={[-offset - 0.1, 0, 0]}>
        {/* メイン壁パネル */}
        <mesh position={[0, wallHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.18, wallHeight, GRID_SIZE_Z]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
        </mesh>

        {/* 足元の巾木 (ベースボード) */}
        <mesh position={[0.02, 0.08, 0]} receiveShadow>
          <boxGeometry args={[0.16, 0.16, GRID_SIZE_Z]} />
          <meshStandardMaterial color={baseboardColor} roughness={0.7} />
        </mesh>

        {/* 上部のトップトリム */}
        <mesh position={[0.02, wallHeight, 0]}>
          <boxGeometry args={[0.16, 0.08, GRID_SIZE_Z]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} />
        </mesh>
      </group>

      {/* 部屋の角のコーナージョイントピラー */}
      <mesh position={[-offset - 0.1, wallHeight / 2, -offset - 0.1]}>
        <boxGeometry args={[0.24, wallHeight + 0.05, 0.24]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.6} />
      </mesh>
    </group>
  );
}
