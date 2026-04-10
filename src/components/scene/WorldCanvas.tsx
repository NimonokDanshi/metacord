'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrthographicCamera, ContactShadows, OrbitControls } from '@react-three/drei';
import { COLORS } from '@/constants/voxel';
import { VoxelRoom } from '../office/VoxelRoom';
import { OfficeFurniture } from '../office/OfficeFurniture';
import { VoxelMember } from '../members/VoxelMember';
import { useRoom } from '@/hooks/useRoom';
import { useRoomStore } from '@/store/roomStore';
import { useDiscordStore } from '@/store/discordStore';
import { getDiscordAvatarUrl } from '@/types/discord';
import { SeatOccupant, AvatarType } from '@/types/room';
import { VoxelModal } from '../ui/VoxelModal';
import { AvatarSelector } from '../ui/AvatarSelector';
import { FurnitureBottomBar } from '@/features/room/components/ui/FurnitureBottomBar';

export function WorldCanvas() {
  // Supabase/Presence の同期を開始
  useRoom();
  const { occupants, isEditing, setEditing } = useRoomStore();
  const { voiceStates, addLogMessage } = useDiscordStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // 統合されたメンバーリストを作成
  const mergedMembers = React.useMemo(() => {
    const list: Array<{ occupant: SeatOccupant; voiceState?: any }> = [];
    const processedUserIds = new Set<string>();
    // 固定の6座席インデックス
    const ISLAND_SEATS = [51, 53, 55, 87, 89, 91];
    const occupiedSeatsInList = new Set<number>();

    // 1. まずは Presence (アクティビティ起動中) のユーザーを反映
    occupants.forEach((occ) => {
      const vs = voiceStates.find((s) => String(s.user.id) === String(occ.user_id));
      
      // 座席が島の中にあり、かつ重複していないか確認
      let finalSeat = occ.seat_index;
      if (!ISLAND_SEATS.includes(finalSeat) || occupiedSeatsInList.has(finalSeat)) {
        // 島の中の空いている席を探す
        const fallback = ISLAND_SEATS.find(s => !occupiedSeatsInList.has(s));
        if (fallback !== undefined) finalSeat = fallback;
      }

      list.push({ 
        occupant: { ...occ, seat_index: finalSeat }, 
        voiceState: vs 
      });
      processedUserIds.add(String(occ.user_id));
      occupiedSeatsInList.add(finalSeat);
    });

    // 2. 残りの空き席を特定
    const remainingSeats = ISLAND_SEATS.filter(s => !occupiedSeatsInList.has(s));

    // 3. ボイスチャンネルにのみいるユーザーを追加
    const voiceOnlyUsers = voiceStates
      .filter((vs) => !processedUserIds.has(String(vs.user.id)))
      .sort((a, b) => String(a.user.id).localeCompare(String(b.user.id)));

    voiceOnlyUsers.forEach((vs, index) => {
      if (index < remainingSeats.length) {
        const finalSeat = remainingSeats[index];
        const syntheticOccupant: SeatOccupant = {
          user_id: String(vs.user.id),
          display_name: vs.user.global_name || vs.user.username,
          avatar_url: getDiscordAvatarUrl(vs.user),
          seat_index: finalSeat,
          avatar_type: ((vs.user as any).mock_avatar_type as AvatarType) || 'default',
        };
        list.push({ occupant: syntheticOccupant, voiceState: vs });
        occupiedSeatsInList.add(finalSeat);
      }
    });
    
    return list;
  }, [occupants, voiceStates]);

  return (
    <div className="relative w-full h-full bg-[#1a1a2e]">
      {/* UI Overlay */}
      <div className="absolute top-6 right-6 z-[50] flex flex-col gap-4 items-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative cursor-pointer"
        >
          {/* Voxel-artish Button Label */}
          <div className="bg-[#4cc9f0] border-4 border-[#4361ee] px-6 py-2 shadow-[4px_4px_0_0_#3f37c9] group-hover:translate-y-1 group-hover:shadow-none transition-all">
            <span className="text-white font-black text-xl tracking-[0.2em] uppercase drop-shadow-[2px_2px_0_#4361ee]">
              Avatar
            </span>
          </div>
          {/* Tiny pixels decoration */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/40" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/40" />
        </button>

        {/* Edit Room Button */}
        <button
          onClick={() => setEditing(!isEditing)}
          className="group relative cursor-pointer"
        >
          <div className={`
            ${isEditing ? 'bg-[#ff4d6d] border-[#c9184a] shadow-[4px_4px_0_0_#a4133c]' : 'bg-[#7209b7] border-[#560bad] shadow-[4px_4px_0_0_#480ca8]'}
            border-4 px-6 py-2 group-hover:translate-y-1 group-hover:shadow-none transition-all
          `}>
            <span className="text-white font-black text-xl tracking-[0.2em] uppercase drop-shadow-[2px_2px_0_#480ca8]">
              {isEditing ? 'Exit' : 'Edit'}
            </span>
          </div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/20" />
        </button>
      </div>

      {/* Furniture Bottom Bar */}
      <FurnitureBottomBar />

      <VoxelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Select Your Avatar"
      >
        <AvatarSelector />
      </VoxelModal>

      <Canvas shadows={{ type: THREE.PCFShadowMap }} gl={{ antialias: true, stencil: false }}>
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

            {/* 参加者 (統合リスト) */}
            {mergedMembers.map(({ occupant, voiceState }, index) => (
              <VoxelMember 
                key={`${String(occupant.user_id)}_${index}`} 
                occupant={occupant} 
                voiceState={voiceState} 
              />
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
