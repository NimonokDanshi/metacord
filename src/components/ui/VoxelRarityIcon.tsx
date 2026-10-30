import React from 'react';
import { AvatarRarity } from '@/types/avatar';
import { RARITY_CONFIG } from '@/constants/rarity';

interface Props {
  rarity: AvatarRarity;
  size?: number;
  className?: string;
}

/**
 * ボクセルアート風のシンプルなランクアイコン
 * 16x16のピクセルグリッドで描画されたレトロ・ボクセルデザイン
 */
export function VoxelRarityIcon({ rarity, size = 16, className = '' }: Props) {
  const config = RARITY_CONFIG[rarity];
  const { color, accentColor } = config;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={className}
    >
      {/* ⚪ Common: ボクセルキューブ (1ブロック) */}
      {rarity === 'common' && (
        <>
          {/* 上面 (Top Light) */}
          <rect x="4" y="3" width="8" height="3" fill="#e2e8f0" />
          <rect x="5" y="2" width="6" height="1" fill="#f8fafc" />
          {/* 正面 (Front) */}
          <rect x="4" y="6" width="8" height="6" fill={color} />
          {/* ハイライト & シャドウ */}
          <rect x="4" y="6" width="1" height="6" fill="#cbd5e1" />
          <rect x="4" y="11" width="8" height="1" fill={accentColor} />
          <rect x="11" y="6" width="1" height="6" fill={accentColor} />
        </>
      )}

      {/* 🔵 Rare: ボクセルダイヤモンド/クリスタル */}
      {rarity === 'rare' && (
        <>
          {/* 上面カット */}
          <rect x="6" y="2" width="4" height="2" fill="#93c5fd" />
          <rect x="4" y="4" width="8" height="3" fill="#60a5fa" />
          {/* 下部コーン */}
          <rect x="5" y="7" width="6" height="3" fill={color} />
          <rect x="6" y="10" width="4" height="2" fill={accentColor} />
          <rect x="7" y="12" width="2" height="2" fill="#1e3a8a" />
          {/* ハイライト */}
          <rect x="6" y="4" width="2" height="3" fill="#ffffff" opacity="0.8" />
        </>
      )}

      {/* 🟣 Epic: ボクセルクラウン (王冠) */}
      {rarity === 'epic' && (
        <>
          {/* クラウンの尖頭 (3本) */}
          <rect x="2" y="4" width="2" height="4" fill="#d8b4fe" />
          <rect x="7" y="2" width="2" height="6" fill="#e9d5ff" />
          <rect x="12" y="4" width="2" height="4" fill="#d8b4fe" />
          {/* クラウン胴体 */}
          <rect x="2" y="8" width="12" height="4" fill={color} />
          {/* バンド & 宝石 */}
          <rect x="2" y="11" width="12" height="2" fill={accentColor} />
          <rect x="4" y="9" width="2" height="2" fill="#f472b6" />
          <rect x="7" y="9" width="2" height="2" fill="#ffffff" />
          <rect x="10" y="9" width="2" height="2" fill="#f472b6" />
        </>
      )}

      {/* 🟡 Legendary: ボクセルスター (輝く4芒星) */}
      {rarity === 'legendary' && (
        <>
          {/* 縦の軸 */}
          <rect x="7" y="1" width="2" height="14" fill={color} />
          {/* 横の軸 */}
          <rect x="1" y="7" width="14" height="2" fill={color} />
          {/* 中心のコア */}
          <rect x="5" y="5" width="6" height="6" fill="#fde047" />
          <rect x="6" y="6" width="4" height="4" fill="#ffffff" />
          {/* 斜めアクセント */}
          <rect x="4" y="4" width="2" height="2" fill={accentColor} />
          <rect x="10" y="4" width="2" height="2" fill={accentColor} />
          <rect x="4" y="10" width="2" height="2" fill={accentColor} />
          <rect x="10" y="10" width="2" height="2" fill={accentColor} />
        </>
      )}

      {/* 🌈 Ultimate: コズミック・ボクセルジェム (翼/オーラ付きコア) */}
      {rarity === 'ultimate' && (
        <>
          {/* 翼・光の羽 */}
          <rect x="1" y="5" width="2" height="4" fill="#818cf8" />
          <rect x="13" y="5" width="2" height="4" fill="#818cf8" />
          <rect x="2" y="3" width="2" height="3" fill="#c084fc" />
          <rect x="12" y="3" width="2" height="3" fill="#c084fc" />
          {/* コアのダイヤ */}
          <rect x="5" y="3" width="6" height="2" fill="#f472b6" />
          <rect x="4" y="5" width="8" height="6" fill={color} />
          <rect x="6" y="11" width="4" height="3" fill={accentColor} />
          {/* 輝く中心光 */}
          <rect x="6" y="6" width="4" height="4" fill="#ffffff" />
          <rect x="7" y="5" width="2" height="6" fill="#ffffff" />
          <rect x="5" y="7" width="6" height="2" fill="#ffffff" />
        </>
      )}
    </svg>
  );
}
