'use client';

import React, { useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useRoomStore } from '@/store/roomStore';
import { useVoxelGrid } from '@/hooks/useVoxelGrid';
import { ROOM_ITEMS } from '../../constants/items';
import { DynamicFurniture } from '@/features/office/components/DynamicFurniture';
import { useRoomEditor } from '../../hooks/useRoomEditor';
import { Html } from '@react-three/drei';

export function PlacementPreview() {
  const { isEditing, selectedItemId, previewPosition, setPreviewPosition, setSelectedItem } = useRoomStore();
  const { getGridFromWorld, getWorldFromGrid, checkCollision } = useVoxelGrid();
  const { saveFurniture } = useRoomEditor();
  const { raycaster, mouse, camera, gl } = useThree();
  const [canPlace, setCanPlace] = useState(false);

  // 選択中のアイテム情報を取得
  const selectedItem = ROOM_ITEMS.find(it => it.id === selectedItemId);

  useFrame(() => {
    if (!isEditing || !selectedItem) {
      if (previewPosition) setPreviewPosition(null);
      return;
    }

    // 床面 (y=0) とのマウス交差判定
    raycaster.setFromCamera(mouse, camera);
    const intersectPoint = raycaster.ray.intersectPlane(
      new (require('three').Plane)(new (require('three').Vector3)(0, 1, 0), 0),
      new (require('three').Vector3)()
    );

    if (intersectPoint) {
      const [gx, gz] = getGridFromWorld(intersectPoint.x, intersectPoint.z);
      
      // プレビュー位置を更新 (変更があったときのみ)
      if (!previewPosition || previewPosition[0] !== gx || previewPosition[1] !== gz) {
        setPreviewPosition([gx, gz]);
        
        // 衝突判定 (一旦空のセットを渡す。タスク6でDBと連携)
        const ok = checkCollision(gx, gz, selectedItem.sizeX, selectedItem.sizeZ, new Set());
        setCanPlace(ok);
      }
    }
  });

  if (!isEditing || !selectedItem || !previewPosition) return null;

  const worldPos = getWorldFromGrid(previewPosition[0], previewPosition[1]);

  return (
    <group position={[worldPos.x, worldPos.y, worldPos.z]}>
      {/* 判定グリッドハイライト */}
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
      <group opacity={0.6}>
        <DynamicFurniture item={selectedItem} opacity={0.6} />
      </group>

      {/* 配置決定・キャンセルボタン (ラストウォー風) */}
      {canPlace && (
        <Html position={[0, 2, 0]} center>
          <div className="flex gap-4 pointer-events-auto">
            <button 
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!selectedItem || !previewPosition) return;
                
                const { data, error } = await saveFurniture(
                  selectedItem.id, 
                  previewPosition[0], 
                  previewPosition[1], 
                  0 // TODO: 回転機能を追加したい場合はここを可変にする
                );
                
                if (!error) {
                  // 配置成功したら選択を解除
                  setSelectedItem(null);
                }
              }}
              className="w-12 h-12 bg-[#4cc9f0] border-4 border-white shadow-[4px_4px_0_0_#3f37c9] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            >
              <span className="text-white font-black text-2xl">✓</span>
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedItem(null);
              }}
              className="w-12 h-12 bg-[#ff4d6d] border-4 border-white shadow-[4px_4px_0_0_#a4133c] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            >
              <span className="text-white font-black text-2xl">×</span>
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
