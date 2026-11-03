'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrthographicCamera, ContactShadows, OrbitControls } from '@react-three/drei';
import { COLORS, GRID_SIZE_X, GRID_SIZE_Z } from '@/constants/voxel';
import { VoxelRoom } from '../office/VoxelRoom';
import { OfficeFurniture } from '../office/OfficeFurniture';
import { VoxelMember } from '../members/VoxelMember';
import { useRoom } from '@/dispatcher/roomDispatcher';
import { useRoomStore } from '@/stores/roomStore';
import { useVoxelGrid } from '@/utils/voxelGrid';
import { ROOM_ITEMS } from '@/constants/roomItems';
import { useDiscordStore } from '@/stores/discordStore';
import { getDiscordAvatarUrl } from '@/types/discord';
import { SeatOccupant, AvatarType } from '@/types/room';
import { VoxelModal } from '../ui/VoxelModal';
import { AvatarSelector } from '../ui/AvatarSelector';
import { FurnitureBottomBar } from '@/components/ui/FurnitureBottomBar';
import { PlacementPreview } from '@/components/scene/PlacementPreview';
import { DramaticCameraController } from '@/components/scene/DramaticCameraController';
import { MySetSelector } from '../ui/MySetSelector';
import { useVoiceCommand } from '@/actions/voiceActions';
import { VoiceStatusIndicator } from '../ui/VoiceStatusIndicator';
import { EmoteBar } from '../ui/EmoteBar';
import { RoomToasts } from '../ui/RoomToasts';

export function WorldCanvas() {
  // ボイスコマンドの有効化
  useVoiceCommand();
  
  // Supabase/Presence の同期を開始
  useRoom();
  const { occupants, leavingOccupants, isEditing, setEditing, furnitures } = useRoomStore();
  const { user, avatarType, mySet, voiceStates, addLogMessage } = useDiscordStore();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);
  const [isMySetModalOpen, setIsMySetModalOpen] = React.useState(false);

  // 統合されたメンバーリストを作成 (在室者 + 退室演出中 + ボイスのみ)
  const mergedMembers = React.useMemo(() => {
    const list: Array<{ occupant: SeatOccupant; voiceState?: any; isLeaving?: boolean }> = [];
    const processedUserIds = new Set<string>();
    
    // 現在 Presence で占有されている座席と家具を把握
    const occupiedSeats = new Set<number>();
    const occupiedFurnitureIds = new Set<string>();

    // 1. まずは Presence (アクティビティ起動中) のユーザーを反映
    occupants.forEach((occ) => {
      const isMe = user && String(occ.user_id) === String(user.id);
      const vs = voiceStates.find((s) => String(s.user.id) === String(occ.user_id));
      
      const finalOccupant: SeatOccupant = isMe ? {
        ...occ,
        avatar_type: avatarType,
        metadata: { myset: mySet }
      } : occ;

      list.push({ occupant: finalOccupant, voiceState: vs, isLeaving: false });
      
      processedUserIds.add(String(occ.user_id));
      occupiedSeats.add(occ.seat_index);
      if (occ.furniture_id) occupiedFurnitureIds.add(occ.furniture_id);
    });

    // 2. 退室アニメーション演出中のユーザーを追加
    leavingOccupants.forEach(({ occupant: occ }) => {
      if (!processedUserIds.has(String(occ.user_id))) {
        list.push({ occupant: occ, isLeaving: true });
        processedUserIds.add(String(occ.user_id));
      }
    });

    // 3. 空いている「椅子属性を持つ家具」をリストアップ
    const availableSeatFurnitures = furnitures.filter(f => {
      const item = ROOM_ITEMS.find(it => it.id === f.item_id);
      return item?.isSeat && !occupiedFurnitureIds.has(f.id);
    });

    // 4. ボイスチャンネルにのみいるユーザーを追加 (空いている家具があれば優先的に座らせる)
    const voiceOnlyUsers = voiceStates
      .filter((vs) => !processedUserIds.has(String(vs.user.id)))
      .sort((a, b) => String(a.user.id).localeCompare(String(b.user.id)));

    let furnitureIdx = 0;
    const MAX_SEATS = GRID_SIZE_X * GRID_SIZE_Z;

    voiceOnlyUsers.forEach((vs) => {
      const isMe = user && String(vs.user.id) === String(user.id);
      
      let finalSeat = 0;
      let finalFurnitureId: string | undefined = undefined;

      // 自分の場合はストアの座席インデックスを優先
      const { mySeatIndex: storeSeatIndex, myFurnitureId: storeFurnitureId } = useRoomStore.getState();
      
      if (isMe && storeSeatIndex !== null) {
        finalSeat = storeSeatIndex;
        finalFurnitureId = storeFurnitureId || undefined;
      } else if (furnitureIdx < availableSeatFurnitures.length) {
        const f = availableSeatFurnitures[furnitureIdx++];
        finalSeat = f.pos_z * GRID_SIZE_X + f.pos_x;
        finalFurnitureId = f.id;
      } else {
        for (let i = 0; i < MAX_SEATS; i++) {
          if (!occupiedSeats.has(i)) {
            finalSeat = i;
            occupiedSeats.add(i);
            break;
          }
        }
      }

      const syntheticOccupant: SeatOccupant = {
        user_id: String(vs.user.id),
        display_name: vs.user.global_name || vs.user.username,
        avatar_url: getDiscordAvatarUrl(vs.user),
        seat_index: finalSeat,
        furniture_id: finalFurnitureId,
        avatar_type: isMe ? avatarType : (((vs.user as any).mock_avatar_type as AvatarType) || 'default'),
        metadata: isMe ? { myset: mySet } : undefined,
      };
      
      list.push({ occupant: syntheticOccupant, voiceState: vs, isLeaving: false });
    });
    
    return list;
  }, [occupants, leavingOccupants, voiceStates, furnitures, user, avatarType, mySet]);

  return (
    <div className="relative w-full h-full bg-[radial-gradient(ellipse_at_top,_#1e293b_0%,_#0f172a_55%,_#050811_100%)]">
      {/* リアルタイム入退室トースト */}
      <RoomToasts />

      {/* UI Overlay */}
      <div className="absolute top-6 right-6 z-[50] flex flex-col gap-4 items-end">
        <button
          onClick={() => setIsAvatarModalOpen(true)}
          className="group relative cursor-pointer"
        >
          <div className="bg-[#4cc9f0] border-4 border-[#4361ee] px-6 py-2 shadow-[4px_4px_0_0_#3f37c9] group-hover:translate-y-1 group-hover:shadow-none transition-all">
            <span className="text-white font-black text-xl tracking-[0.2em] uppercase drop-shadow-[2px_2px_0_#4361ee]">
              Avatar
            </span>
          </div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/40" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/40" />
        </button>

        {/* MySet Button */}
        <button
          onClick={() => setIsMySetModalOpen(true)}
          className="group relative cursor-pointer"
        >
          <div className="bg-[#4361ee] border-4 border-[#3f37c9] px-6 py-2 shadow-[4px_4px_0_0_#3a0ca3] group-hover:translate-y-1 group-hover:shadow-none transition-all">
            <span className="text-white font-black text-xl tracking-[0.2em] uppercase drop-shadow-[2px_2px_0_#3a0ca3]">
              MySet
            </span>
          </div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/20" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/20" />
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

      {/* リアルタイム・エモートバー */}
      <EmoteBar />

      {/* Furniture Bottom Bar */}
      <FurnitureBottomBar />
 
      {/* Voice Status Indicator */}
      <VoiceStatusIndicator />

      <VoxelModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
        title="Select Your Avatar"
      >
        <AvatarSelector />
      </VoxelModal>

      <VoxelModal 
        isOpen={isMySetModalOpen} 
        onClose={() => setIsMySetModalOpen(false)} 
        title="Customize Your Workspace"
      >
        <MySetSelector />
      </VoxelModal>

      <Canvas shadows={{ type: THREE.PCFShadowMap }} gl={{ antialias: true, stencil: false }}>
        {/* Unrailed! 風の固定カメラ視点 (正投影) */}
        <OrthographicCamera
          makeDefault
          position={[10, 10.8, 10]}
          zoom={50}
          near={0.1}
          far={1000}
        />
        
        <OrbitControls 
          target={[0, 0.8, 0]}
          enablePan={false} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1} 
          minZoom={25}
          maxZoom={120}
          enabled={!isEditing}
        />

        {/* 大声・シャウト・Legendary家具発動時のドラマチック自動ズーム */}
        <DramaticCameraController />

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

            {/* 参加者 (統合リスト: 在室者 + 退室演出中) */}
            {mergedMembers.map(({ occupant, voiceState, isLeaving }, index) => {
              return (
                <VoxelMember 
                  key={`${String(occupant.user_id)}_${index}`} 
                  occupant={occupant} 
                  voiceState={voiceState} 
                  isLeaving={isLeaving}
                />
              );
            })}

            {/* 家具配置プレビュー */}
            <PlacementPreview />
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
