import React from 'react';

/**
 * アバターのレアリティ（ランク）
 */
export type AvatarRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'ultimate';

/**
 * すべてのアバター3Dモデルが実装すべき共通インターフェース（Props）
 */
export interface AvatarModelProps {
  /** アバターのメインカラー */
  color?: string;
  /** 肌の色 (対応モデルのみ) */
  skinColor?: string;
  /** 着席中フラグ (座りポーズや位置オフセットに使用) */
  isSitting?: boolean;
  /** 発言中フラグ (ボイス連動アニメーション等に使用) */
  isSpeaking?: boolean;
}

/**
 * アバターのメタデータ定義
 */
export interface AvatarMetadata {
  /** アバター固有の識別子 */
  id: string;
  /** 表示名 */
  name: string;
  /** 説明文 */
  description: string;
  /** レアリティ（ランク） */
  rarity: AvatarRarity;
  /** 描画する3Dコンポーネント (AvatarModelPropsを満たすもの) */
  component: React.ComponentType<AvatarModelProps>;
  /** 入室時SEの識別子（オプション） */
  soundEffect?: string;
}
