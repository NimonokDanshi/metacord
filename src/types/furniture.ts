import React from 'react';

export interface Furniture {
  id: string;
  server_id: string;
  item_id: string; // items.ts で定義したID (standard-deskなど)
  pos_x: number;
  pos_z: number;
  rotation: number;
  metadata?: any;
}

export type NewFurniture = Omit<Furniture, 'id'>;

/**
 * すべての家具3Dモデルが受け取れる共通インターフェース
 */
export interface FurnitureModelProps {
  pos?: { x: number; y: number; z: number };
  rotation?: number;
  isOccupied?: boolean;
  occupantMySet?: any;
  colorOverride?: string;
  opacity?: number;
  /** 着席者の発話状態 (ボイス連動) */
  isSpeaking?: boolean;
  /** 着席者の声の音量 (0.0 ~ 1.0) */
  voiceVolume?: number;
  /** 着席者の大声・シャウト判定 */
  isShouting?: boolean;
  /** 着席者のユーザーID */
  occupantId?: string;
}
