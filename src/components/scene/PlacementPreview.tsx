'use client';

import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useRoomStore } from '@/stores/roomStore';
import { useVoxelGrid } from '@/utils/voxelGrid';
import { ROOM_ITEMS } from '@/constants/roomItems';
import { DynamicFurniture } from '@/components/office/DynamicFurniture';
import { roomActions } from '@/actions/roomActions';
import { Html } from '@react-three/drei';

export function PlacementPreview() {
  const { 
    isEditing, 
    selectedItemId, 
    previewPosition, 
    previewRotation, 
    movingFurnitureId,
    setPreviewPosition, 
    setPreviewRotation, 
    setSelectedItem, 
    setMovingFurnitureId,
    getOccupiedGrids 
  } = useRoomStore();
  const { getGridFromWorld, getWorldFromGrid, checkCollision } = useVoxelGrid();
  // roomActions を直接利用するため、ここではフックの呼び出しを削除
  const { raycaster, mouse, camera } = useThree();
  const [canPlace, setCanPlace] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 選択中のアイテム情報を取得
  const selectedItem = ROOM_ITEMS.find(it => it.id === selectedItemId);

  // マウスダウン・アップのイベントハンドラ
  const { gl } = useThree();

  const handleConfirm = async () => {
    if (!selectedItem || !previewPosition) {
      console.error('[PlacementPreview] No item or position!');
      return;
    }

    let result;
    if (movingFurnitureId) {
      // 既存家具の更新
      console.log('[PlacementPreview] Calling updateFurniture:', movingFurnitureId);
      result = await roomActions.updateFurniture(
        movingFurnitureId,
        previewPosition[0],
        previewPosition[1],
        previewRotation
      );
    } else {
      // 新規保存
      console.log('[PlacementPreview] Calling saveFurniture:', selectedItem.id);
      result = await roomActions.saveFurniture(
        selectedItem.id,
        previewPosition[0],
        previewPosition[1],
        previewRotation
      );
    }

    if (result.error) {
      console.error('[PlacementPreview] Action failed:', result.error);
    } else {
      console.log('[PlacementPreview] Action success:', result.data);
      setSelectedItem(null);
      setMovingFurnitureId(null);
    }
  };

  const handleCancel = () => {
    console.log('[PlacementPreview] Cancelled');
    setSelectedItem(null);
    setMovingFurnitureId(null);
  };

  const handleDelete = async () => {
    if (!movingFurnitureId) return;
    
    console.log('[PlacementPreview] Deleting furniture:', movingFurnitureId);
    const result = await roomActions.deleteFurniture(movingFurnitureId);
    
    if (result.success) {
      setSelectedItem(null);
      setMovingFurnitureId(null);
    }
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // ターゲットが Canvas 本体である場合のみドラッグを開始 (ボタン等のクリックを無視)
      if (e.button === 0 && (e.target as HTMLElement).tagName === 'CANVAS') {
        setIsDragging(true);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    const handleWheel = (e: WheelEvent) => {
      if (!isEditing || !selectedItemId) return;
      // 45度 (Math.PI / 4) ずつ回転
      const step = Math.PI / 4;
      const direction = e.deltaY > 0 ? 1 : -1;
      setPreviewRotation(previewRotation + direction * step);
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel);
    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [gl, isEditing, selectedItemId, previewRotation, setPreviewRotation]);

  useFrame(() => {
    if (!isEditing || !selectedItem) {
      if (previewPosition) setPreviewPosition(null);
      return;
    }

    // ドラッグ中のみ、または位置が未定のときのみ更新
    if (isDragging || !previewPosition) {
      // 床面 (y=0) とのマウス交差判定
      raycaster.setFromCamera(mouse, camera);
      const intersectPoint = raycaster.ray.intersectPlane(
        new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
        new THREE.Vector3()
      );

      if (intersectPoint) {
        const [gx, gz] = getGridFromWorld(intersectPoint.x, intersectPoint.z);
        
        // プレビュー位置を更新 (変更があったときのみ)
        if (!previewPosition || previewPosition[0] !== gx || previewPosition[1] !== gz) {
          setPreviewPosition([gx, gz]);
          
          // 既存の家具との衝突判定
          const occupied = getOccupiedGrids();
          const ok = checkCollision(gx, gz, selectedItem.sizeX, selectedItem.sizeZ, occupied);
          setCanPlace(ok);
        }
      }
    }
  });

  if (!isEditing || !selectedItem || !previewPosition) return null;

  const worldPos = getWorldFromGrid(previewPosition[0], previewPosition[1]);

  return (
    <group position={[worldPos.x, worldPos.y, worldPos.z]} rotation={[0, previewRotation, 0]}>
      {/* 判定グリッドハイライト */}
      {/* モデルの中心がグリッドの中心に合うように調整 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[selectedItem.sizeX / 2 - 0.5, 0.01, selectedItem.sizeZ / 2 - 0.5]}>
        <planeGeometry args={[selectedItem.sizeX, selectedItem.sizeZ]} />
        <meshStandardMaterial 
          color={canPlace ? "#4cc9f0" : "#ff4d6d"} 
          transparent 
          opacity={0.5} 
          emissive={canPlace ? "#4cc9f0" : "#ff4d6d"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 半透明モデルプレビュー */}
      <group>
        <DynamicFurniture item={selectedItem} opacity={0.6} />
      </group>

      {/* 配置決定・キャンセル・削除ボタン (3D追従) */}
      {!isDragging && (
        <Html position={[0, 2, 0]} center pointerEvents="auto" portal={{ current: gl.domElement.parentElement as HTMLElement }}>
          <div className="flex flex-col items-center gap-3 pointer-events-auto select-none" onPointerDown={e => e.stopPropagation()}>
            <div className="flex gap-4">
              {/* 確定ボタン: 配置可能な場合のみ表示 */}
              {canPlace && (
                <button 
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[PlacementPreview] ✓ Clicked');
                    await handleConfirm();
                  }}
                  className="w-14 h-14 bg-[#4cc9f0] border-4 border-white shadow-[0_4px_10px_rgba(76,201,240,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-white font-black text-3xl">✓</span>
                </button>
              )}

              {/* キャンセルボタン: 常に表示 */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[PlacementPreview] × Clicked');
                  handleCancel();
                }}
                className="w-14 h-14 bg-[#ff4d6d] border-4 border-white shadow-[0_4px_10px_rgba(255,77,109,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-white font-black text-3xl">×</span>
              </button>

              {/* 削除ボタン: 既存家具の移動中のみ表示 (黄色) */}
              {movingFurnitureId && (
                <button 
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await handleDelete();
                  }}
                  className="w-14 h-14 bg-[#fee440] border-4 border-white shadow-[0_4px_10px_rgba(254,228,64,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>

            {/* 配置不可時の警告ラベル */}
            {!canPlace && (
              <div className="bg-[#ff4d6d] px-3 py-1 border-2 border-white shadow-md animate-bounce">
                <span className="text-white font-black text-[10px] uppercase tracking-tighter">
                  Cannot Place Here
                </span>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
