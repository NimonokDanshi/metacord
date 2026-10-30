import React from 'react';

/**
 * すべてのアバター3Dモデルが実装すべき共通インターフェース（Props）
 * 新しいアバターを作成する際はこのPropsを受け取るように実装します。
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
  /** 描画する3Dコンポーネント (AvatarModelPropsを満たすもの) */
  component: React.ComponentType<AvatarModelProps>;
}
