import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useVoxelGrid } from '@/utils/voxelGrid';
import { useRoomStore } from '@/stores/roomStore';
import { useDiscordStore } from '@/stores/discordStore';
import { ROOM_ITEMS } from '@/constants/roomItems';
import { HEIGHT_MEMBER_SITTING, HEIGHT_MEMBER_STANDING } from '@/constants/voxel';
import { getAvatarMetadata } from '@/constants/avatarRegistry';
import type { SeatOccupant } from '@/types/room';
import type { VoiceState } from '@/types/discord';

export function useAvatarLogic(
  occupant: SeatOccupant, 
  voiceState?: VoiceState,
  isLeaving: boolean = false
) {
  const { getPositionFromSeat, getWorldFromGrid } = useVoxelGrid();
  const { furnitures, userEmotes, finishLeavingAnimation } = useRoomStore();
  const groupRef = useRef<THREE.Group>(null);

  // 座席座標の計算 (目標座標)
  const targetPos = useMemo(() => {
    // 1. 家具に紐付いている場合
    if (occupant.furniture_id) {
      const furniture = furnitures.find(f => f.id === occupant.furniture_id);
      if (furniture) {
        const item = ROOM_ITEMS.find(it => it.id === furniture.item_id);
        const basePos = getWorldFromGrid(furniture.pos_x, furniture.pos_z, 0);
        
        if (item?.seatOffset) {
          const { x, y, z } = item.seatOffset;
          const offset = new THREE.Vector3(x, y, z);
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), furniture.rotation);
          
          return {
            x: basePos.x + offset.x,
            y: basePos.y + offset.y + (occupant.furniture_id ? HEIGHT_MEMBER_SITTING : HEIGHT_MEMBER_STANDING),
            z: basePos.z + offset.z,
            rotation: furniture.rotation + item.seatOffset.rotation
          };
        }
      }
    }

    // 2. 家具がない場合のフォールバック（従来のグリッド配置）
    const seatIdx = Number(occupant.seat_index);
    const gridPos = getPositionFromSeat(seatIdx, HEIGHT_MEMBER_STANDING);
    return { ...gridPos, rotation: 0 };
  }, [occupant, furnitures, getWorldFromGrid, getPositionFromSeat]);

  // 現在の補間座標（Lerp 用）
  const currentPosRef = useRef<{ x: number; y: number; z: number; rotation: number }>({
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    rotation: targetPos.rotation,
  });

  // スポーンアニメーション進行度 (0 -> 1)
  const spawnTimerRef = useRef<number>(0);
  const [spawnEffectActive, setSpawnEffectActive] = useState(true);

  // デスポーンアニメーション進行度 (0 -> 1)
  const leaveTimerRef = useRef<number>(0);

  // 移動中フラグ
  const isMovingRef = useRef<boolean>(false);

  // Legendary/ロケット家具用の浮上同期オフセット
  const rocketHoverOffsetRef = useRef<number>(0);

  // ミュート・デフ状態の判定
  const isMuted = voiceState?.voice_state?.self_mute || voiceState?.mute;
  const isDeaf = voiceState?.voice_state?.self_deaf || voiceState?.voice_state?.deaf;
  
  // Discord SDK からのリアルタイム発言状態を取得
  const speakingUserIds = useDiscordStore(s => s.speakingUserIds);
  const userVoiceVolumes = useDiscordStore(s => s.userVoiceVolumes);
  const isSpeaking = speakingUserIds.has(occupant.user_id);
  const voiceVolume = userVoiceVolumes[occupant.user_id] ?? (isSpeaking ? 0.5 : 0);
  const isShouting = isSpeaking && voiceVolume > 0.6;

  // 最新エモートの取得（3.5秒以内）
  const latestEmoteData = userEmotes[occupant.user_id];
  const activeEmote = (latestEmoteData && (Date.now() - latestEmoteData.timestamp < 3500))
    ? latestEmoteData.emote
    : null;

  // アニメーションと同期 (Lerp補間・スポーン・デスポーン・発言バウンド)
  useFrame((state, delta) => {
    if (!groupRef.current || !targetPos) return;

    // --- 1. デスポーン演出 (退室中) ---
    if (isLeaving) {
      leaveTimerRef.current += delta * 1.5; // 約0.7秒で完了
      const t = Math.min(1, leaveTimerRef.current);
      
      // 上空へ昇天しつつ縮小・消散
      groupRef.current.position.y += delta * 3.5;
      const scale = Math.max(0, 1 - t);
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.rotation.y += delta * 8; // 高速スピン

      if (t >= 1) {
        finishLeavingAnimation(occupant.user_id);
      }
      return;
    }

    // --- 2. スポーン演出 (登場時バウンド着地) ---
    if (spawnTimerRef.current < 1) {
      spawnTimerRef.current += delta * 1.8; // 約0.55秒で着地
      const t = Math.min(1, spawnTimerRef.current);
      // イージングバウンド効果 (上空2.5から落ちてきてポヨンと着地)
      const dropOffset = (1 - t) * (1 - t) * 2.5 + Math.sin(t * Math.PI) * 0.2;
      currentPosRef.current.y = targetPos.y + dropOffset;
      const initialScale = Math.min(1, t * 1.2);
      groupRef.current.scale.set(initialScale, initialScale, initialScale);

      if (t >= 1) {
        setSpawnEffectActive(false);
      }
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }

    // --- 3. 水平移動の滑らかな補間 (Lerp) ---
    const dx = targetPos.x - currentPosRef.current.x;
    const dz = targetPos.z - currentPosRef.current.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const lerpSpeed = Math.min(1, delta * 7); // 滑らかな追従
    currentPosRef.current.x = THREE.MathUtils.lerp(currentPosRef.current.x, targetPos.x, lerpSpeed);
    currentPosRef.current.z = THREE.MathUtils.lerp(currentPosRef.current.z, targetPos.z, lerpSpeed);

    // 0.05以上離れていれば移動中と判定
    if (dist > 0.05) {
      isMovingRef.current = true;
      // 進行方向を向く
      const moveAngle = Math.atan2(dx, dz);
      currentPosRef.current.rotation = THREE.MathUtils.lerp(currentPosRef.current.rotation, moveAngle, delta * 10);
    } else {
      isMovingRef.current = false;
      // 目的地に到達したら目標の家具・座席の向きへ戻る
      currentPosRef.current.rotation = THREE.MathUtils.lerp(currentPosRef.current.rotation, targetPos.rotation, delta * 6);
    }

    // 座標適用
    groupRef.current.position.x = currentPosRef.current.x;
    groupRef.current.position.z = currentPosRef.current.z;
    groupRef.current.rotation.y = currentPosRef.current.rotation;

    // --- 4. モーション計算 (歩行ピッチング / 呼吸 / 発言ジャンプ / ロケット浮上連動) ---
    let targetY = targetPos.y;

    // 着席家具が Legendary またはロケットギミックを持つか判定
    const seatedFurniture = occupant.furniture_id ? furnitures.find(f => f.id === occupant.furniture_id) : null;
    const seatedItem = seatedFurniture ? ROOM_ITEMS.find(it => it.id === seatedFurniture.item_id) : null;
    const isRocketFurniture = seatedItem?.rarity === 'legendary' || seatedItem?.id === 'cyber-desk' || seatedItem?.id === 'rocket-chair';

    if (isRocketFurniture) {
      const targetRocketLift = isShouting ? 1.25 : (isSpeaking ? 0.08 : 0);
      rocketHoverOffsetRef.current = THREE.MathUtils.lerp(
        rocketHoverOffsetRef.current,
        targetRocketLift,
        delta * (isShouting ? 8 : 6)
      );
      targetY += rocketHoverOffsetRef.current;
    } else {
      rocketHoverOffsetRef.current = 0;
    }

    if (spawnTimerRef.current < 1) {
      targetY = currentPosRef.current.y;
    } else if (isMovingRef.current) {
      // 歩行中：トコトコと足踏みピッチング
      targetY += Math.abs(Math.sin(state.clock.elapsedTime * 14)) * 0.12;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 14) * 0.08;
    } else {
      // 待機時の微呼吸
      targetY += Math.sin(state.clock.elapsedTime * 1.5) * 0.02;

      // 喋っている時のモーション (レア度連動: Legendaryは空中浮遊、着席時はお尻が浮かないよう配慮)
      if (isSpeaking) {
        const t = state.clock.elapsedTime;
        const avatarMeta = getAvatarMetadata(occupant.avatar_type);
        const rarity = avatarMeta?.rarity || 'common';
        const isSitting = !!occupant.furniture_id;

        if (rarity === 'legendary') {
          // Legendary: 地面でピョンピョン跳ねず、神秘的な空中浮遊(ホバリング)
          const hoverAmp = isShouting ? 0.08 : 0.04;
          targetY += Math.sin(t * (isShouting ? 2.8 : 1.8)) * hoverAmp + (isSitting ? 0.02 : 0.06);
          // 大声咆哮時のみ微細なバイブレーション
          groupRef.current.rotation.z = isShouting ? Math.sin(t * 30) * 0.015 : 0;
        } else if (rarity === 'epic') {
          // Epic: スタイリッシュな浮遊＋軽やかなバウンド
          if (isSitting) {
            targetY += Math.sin(t * 8) * 0.02;
          } else {
            const amp = isShouting ? 0.08 : 0.04;
            targetY += Math.abs(Math.sin(t * (isShouting ? 14 : 9))) * amp;
          }
          groupRef.current.rotation.z = Math.sin(t * 12) * (isShouting ? 0.03 : 0.015);
        } else if (rarity === 'rare') {
          // Rare: 愛らしいリズミカルなステップ
          if (isSitting) {
            targetY += Math.sin(t * 10) * 0.025;
          } else {
            const amp = isShouting ? 0.10 : 0.05;
            targetY += Math.abs(Math.sin(t * (isShouting ? 16 : 10))) * amp;
          }
          groupRef.current.rotation.z = Math.sin(t * 14) * (isShouting ? 0.04 : 0.02);
        } else {
          // Common: 素朴で小さなステップ
          if (isSitting) {
            targetY += Math.sin(t * 12) * 0.015;
          } else {
            const amp = isShouting ? 0.06 : 0.03;
            targetY += Math.abs(Math.sin(t * (isShouting ? 14 : 9))) * amp;
          }
          groupRef.current.rotation.z = Math.sin(t * 12) * (isShouting ? 0.03 : 0.015);
        }
      } else {
        groupRef.current.rotation.z = 0;
      }
    }

    groupRef.current.position.y = targetY;
  });

  return {
    groupRef,
    pos: targetPos,
    isMuted,
    isDeaf,
    isSpeaking,
    voiceVolume,
    isShouting,
    activeEmote,
    isLeaving,
    displayName: occupant.display_name,
    avatarUrl: occupant.avatar_url,
  };
}
