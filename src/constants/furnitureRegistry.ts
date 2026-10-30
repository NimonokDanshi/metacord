import React from 'react';
import { Workstation } from '@/components/models/desk/Workstation';
import { CustomWorkstation } from '@/components/models/desk/CustomWorkstation';
import { JapandiWorkstation } from '@/components/models/desk/JapandiWorkstation';
import { Chair } from '@/components/models/chair/Chair';
import { JapandiChair } from '@/components/models/chair/JapandiChair';
import { Wall } from '@/components/models/wall/Wall';
import { Floor } from '@/components/models/floor/Floor';
import { PottedPlant } from '@/components/models/furniture/PottedPlant';
import { FurnitureModelProps } from '@/types/furniture';

export interface FurnitureRegistryEntry {
  /** 通常時の描画コンポーネント */
  component: React.ComponentType<FurnitureModelProps>;
  /** 着席時に専用モデルへ差し替える場合のコンポーネント (オプション) */
  occupiedComponent?: React.ComponentType<FurnitureModelProps>;
}

/**
 * 家具レジストリ
 * roomItems の modelComponent 名、または item_id とコンポーネントを紐付けます。
 * 新しい家具を追加した際はここに1行登録するだけで、DynamicFurnitureなどの条件分岐を一切触らずに反映されます。
 */
export const FURNITURE_REGISTRY: Record<string, FurnitureRegistryEntry> = {
  Workstation: {
    component: Workstation as unknown as React.ComponentType<FurnitureModelProps>,
    occupiedComponent: CustomWorkstation as unknown as React.ComponentType<FurnitureModelProps>,
  },
  JapandiWorkstation: {
    component: JapandiWorkstation as unknown as React.ComponentType<FurnitureModelProps>,
  },
  Chair: {
    component: Chair as unknown as React.ComponentType<FurnitureModelProps>,
  },
  JapandiChair: {
    component: JapandiChair as unknown as React.ComponentType<FurnitureModelProps>,
  },
  PottedPlant: {
    component: PottedPlant as unknown as React.ComponentType<FurnitureModelProps>,
  },
  Wall: {
    component: Wall as unknown as React.ComponentType<FurnitureModelProps>,
  },
  Floor: {
    component: Floor as unknown as React.ComponentType<FurnitureModelProps>,
  },
};

/**
 * モデル名からコンポーネントを取得
 */
export function getFurnitureEntry(modelComponentName: string): FurnitureRegistryEntry | undefined {
  return FURNITURE_REGISTRY[modelComponentName];
}
