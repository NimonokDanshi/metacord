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
import { MySetSelector } from '../ui/MySetSelector';
import { useVoiceCommand } from '@/actions/voiceActions';
import { VoiceStatusIndicator } from '../ui/VoiceStatusIndicator';

export function WorldCanvas() {
  // ボイスコマンドの有効化
  useVoiceCommand();
  
  // Supabase/Presence の同期を開始
  useRoom();
  const { occupants, isEditing, setEditing, furnitures } = useRoomStore();
  const { user, avatarType, mySet, voiceStates, addLogMessage } = useDiscordStore();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);
  const [isMySetModalOpen, setIsMySetModalOpen] = React.useState(false);

  // 統合されたメンバーリストを作成
  const mergedMembers = React.useMemo(() => {
    const list: Array<{ occupant: SeatOccupant; voiceState?: any }> = [];
    const processedUserIds = new Set<string>();
    
    // 現在 Presence で占有されている座席と家具を把握
    const occupiedSeats = new Set<number>();
    const occupiedFurnitureIds = new Set<string>();

    // 1. まずは Presence (アクティビティ起動中) のユーザーをそのまま反映
    occupants.forEach((occ) => {
      const isMe = user && String(occ.user_id) === String(user.id);
      const vs = voiceStates.find((s) => String(s.user.id) === String(occ.user_id));
      
      // 自分の場合は、ローカルの最新状態を優先して適用（リアルタイム反映のため）
      const finalOccupant: SeatOccupant = isMe ? {
        ...occ,
        avatar_type: avatarType,
        metadata: { myset: mySet }
      } : occ;

      list.push({ occupant: finalOccupant, voiceState: vs });
      
      processedUserIds.add(String(occ.user_id));
      occupiedSeats.add(occ.seat_index);
      if (occ.furniture_id) occupiedFurnitureIds.add(occ.furniture_id);
    });

    // 2. 空いている「椅子属性を持つ家具」をリストアップ
    const availableSeatFurnitures = furnitures.filter(f => {
      const item = ROOM_ITEMS.find(it => it.id === f.item_id);
      return item?.isSeat && !occupiedFurnitureIds.has(f.id);
    });

    // 3. ボイスチャンネルにのみいるユーザーを追加 (空いている家具があれば優先的に座らせる)
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
        // 空いている椅子に座らせる
        const f = availableSeatFurnitures[furnitureIdx++];
        finalSeat = f.pos_z * GRID_SIZE_X + f.pos_x;
        finalFurnitureId = f.id;
      } else {
        // 椅子が足りない場合は、空いているグリッドを探す (z=0付近から優先)
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
      
      list.push({ occupant: syntheticOccupant, voiceState: vs });
    });
    
    return list;
  }, [occupants, voiceStates, furnitures, user, avatarType, mySet]);

  return (
    <div className="relative w-full h-full bg-[#1a1a2e]">
      {/* UI Overlay */}
      <div className="absolute top-6 right-6 z-[50] flex flex-col gap-4 items-end">
        <button
          onClick={() => setIsAvatarModalOpen(true)}
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
          enabled={!isEditing}
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
            {mergedMembers.map(({ occupant, voiceState }, index) => {
              // 座席位置に椅子があるかチェック。なければ立たせる。
              const { getOccupiedGrids } = useRoomStore.getState();
              const occupied = getOccupiedGrids();
              
              // seat_index からグリッド位置を取得
              const gx = occupant.seat_index % 12; // GRID_SIZE_X
              const gz = Math.floor(occupant.seat_index / 12);
              
              const hasFurniture = occupied.has(`${gx},${gz}`);
              
              // 椅子がない（家具がない）場所であれば座るモーションだが、
              // 「椅子が存在しなければランダム位置に立つ」仕様のため、
              // ここでは簡易的に、全アバターに対して「家具がない場所」を探すロジックが必要。
              // 現状の VoxelMember は seat_index を元に動くため、
              // 家具の有無に基づいて VoxelMember に渡すデータを調整。
              
              return (
                <VoxelMember 
                  key={`${String(occupant.user_id)}_${index}`} 
                  occupant={occupant} 
                  voiceState={voiceState} 
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
