'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoomStore } from '@/stores/roomStore';
import { useDiscordStore } from '@/stores/discordStore';
import { useVoxelGrid } from '@/utils/voxelGrid';
import { ROOM_ITEMS } from '@/constants/roomItems';
import { HEIGHT_MEMBER_SITTING } from '@/constants/voxel';

const DEFAULT_TARGET = new THREE.Vector3(0, 0.8, 0);
const DEFAULT_ZOOM = 50;
const DRAMATIC_ZOOM = 78;

/**
 * DramaticCameraController
 * - Legendary家具着席中や大声シャウト (isShouting) 発生時に、
 *   自動でカメラが対象アバター＆家具へスムーズにフォーカス＆ズームイン！
 * - 発言が終わると自動で元の俯瞰視点へ滑らかに復帰します。
 */
export function DramaticCameraController() {
  const { camera, controls } = useThree() as { camera: THREE.OrthographicCamera; controls: any };
  const { occupants, furnitures, isEditing } = useRoomStore();
  const { speakingUserIds, userVoiceVolumes } = useDiscordStore();
  const { getWorldFromGrid } = useVoxelGrid();

  const currentFocusTargetRef = useRef<THREE.Vector3>(DEFAULT_TARGET.clone());
  const activeFocusUserRef = useRef<string | null>(null);
  const resetTimerRef = useRef<number>(0);

  useFrame((_, delta) => {
    // 編集モード中、またはコントロールが存在しない場合はスキップ
    if (isEditing || !controls) return;

    let targetShouter: { pos: THREE.Vector3; userId: string } | null = null;

    // シャウトしているユーザーを特定
    for (const occ of Array.from(occupants.values())) {
      const uId = String(occ.user_id);
      const isSpeaking = speakingUserIds.has(uId);
      const volume = userVoiceVolumes[uId] ?? (isSpeaking ? 0.5 : 0);
      const isShouting = isSpeaking && volume > 0.6;

      if (isShouting) {
        // 着席している家具をチェック
        let pos = new THREE.Vector3(0, 0.8, 0);
        if (occ.furniture_id) {
          const f = furnitures.find(item => item.id === occ.furniture_id);
          if (f) {
            const worldPos = getWorldFromGrid(f.pos_x, f.pos_z, 0);
            pos.set(worldPos.x, worldPos.y + HEIGHT_MEMBER_SITTING + 0.5, worldPos.z);
          }
        }
        targetShouter = { pos, userId: uId };
        break; // 最優先の1名にフォーカス
      }
    }

    if (targetShouter) {
      activeFocusUserRef.current = targetShouter.userId;
      resetTimerRef.current = 1.0; // シャウト後もしばらく余韻を残す (1秒)
      currentFocusTargetRef.current.copy(targetShouter.pos);
    } else if (resetTimerRef.current > 0) {
      resetTimerRef.current -= delta;
    } else {
      activeFocusUserRef.current = null;
      currentFocusTargetRef.current.copy(DEFAULT_TARGET);
    }

    const isDramatic = !!activeFocusUserRef.current || resetTimerRef.current > 0;
    const targetZoom = isDramatic ? DRAMATIC_ZOOM : DEFAULT_ZOOM;
    const lerpSpeed = isDramatic ? delta * 5.0 : delta * 2.5;

    // 1. カメラのズーム補間
    if (Math.abs(camera.zoom - targetZoom) > 0.05) {
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, targetZoom, lerpSpeed);
      camera.updateProjectionMatrix();
    }

    // 2. コントロールのターゲット位置補間
    if (controls.target) {
      controls.target.lerp(currentFocusTargetRef.current, lerpSpeed);
      controls.update?.();
    }
  });

  return null;
}
