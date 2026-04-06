'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, ContactShadows, OrbitControls } from '@react-three/drei';
import { COLORS } from '@/constants/voxel';
import { VoxelRoom } from '../office/VoxelRoom';
import { OfficeFurniture } from '../office/OfficeFurniture';
import { VoxelMember } from '../members/VoxelMember';
import { useRoom } from '@/hooks/useRoom';
import { useRoomStore } from '@/store/roomStore';
import { useDiscordStore } from '@/store/discordStore';
import { getDiscordAvatarUrl } from '@/types/discord';
import { SeatOccupant } from '@/types/room';

export function WorldCanvas() {
  // Supabase/Presence の同期を開始
  useRoom();
  const occupants = useRoomStore((state) => state.occupants);
  const { voiceStates, addLogMessage } = useDiscordStore();

  // 統合されたメンバーリストを作成
  const mergedMembers = React.useMemo(() => {
    const list: Array<{ occupant: SeatOccupant; voiceState?: any }> = [];
    const processedUserIds = new Set<string>();

    const ISLAND_SEATS = [51, 53, 55, 87, 89, 91];

    // 1. まずは Presence (アクティビティ起動中) のユーザーを反映
    occupants.forEach((occ) => {
      const vs = voiceStates.find((s) => String(s.user.id) === String(occ.user_id));
      list.push({ occupant: occ, voiceState: vs });
      processedUserIds.add(String(occ.user_id));
    });

    // 2. 現在使用中の座席を特定
    const occupiedSeats = new Set(Array.from(occupants.values()).map(o => o.seat_index));
    const remainingSeats = ISLAND_SEATS.filter(s => !occupiedSeats.has(s));

    // 3. ボイスチャンネルにのみいるユーザーを追加
    const voiceOnlyUsers = voiceStates
      .filter((vs) => !processedUserIds.has(String(vs.user.id)))
      .sort((a, b) => String(a.user.id).localeCompare(String(b.user.id)));

    voiceOnlyUsers.forEach((vs, index) => {
      if (index < remainingSeats.length) {
        const syntheticOccupant: SeatOccupant = {
          user_id: String(vs.user.id),
          display_name: vs.user.global_name || vs.user.username,
          avatar_url: getDiscordAvatarUrl(vs.user),
          seat_index: remainingSeats[index],
        };
        list.push({ occupant: syntheticOccupant, voiceState: vs });
      }
    });
    
    return list;
  }, [occupants, voiceStates]);

  // マージ結果を画面上のログに出力
  useEffect(() => {
    if (mergedMembers.length > 0) {
      const names = mergedMembers.map(m => m.occupant.display_name).join(', ');
      addLogMessage(`[WorldCanvas] マージ完了: ${mergedMembers.length} 名 (${names})`);
    }
  }, [mergedMembers, addLogMessage]);

  return (
    <div className="w-full h-full bg-[#1a1a2e]">
      <Canvas shadows gl={{ antialias: true, stencil: false }}>
        {/* Unrailed! 風の固定カメラ視点 (正投影) */}
        <OrthographicCamera
          makeDefault
          position={[10, 10, 10]}
          zoom={50}
          near={0.1}
          far={1000}
        />
        
        {/* 初期のデバッグ・微調整用。完成後は固定しても良い */}
        <OrbitControls 
          enablePan={false} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1} 
        />

        {/* ライティング */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        >
          <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 20]} />
        </directionalLight>

        <Suspense fallback={null}>
          <group>
            {/* 部屋・床 */}
            <VoxelRoom />

            {/* 家具 (固定) */}
            <OfficeFurniture />

            {/* 参加者 */}
            {Array.from(occupants.values()).map((occupant) => (
              <VoxelMember key={occupant.user_id} occupant={occupant} />
            ))}
          </group>

          {/* 床面への柔らかな影 */}
          <ContactShadows
            opacity={0.4}
            scale={20}
            blur={2.4}
            far={10}
            resolution={256}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
