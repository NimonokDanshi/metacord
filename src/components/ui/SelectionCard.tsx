import React from 'react';
import { VoxelButton } from './VoxelButton';
import { AvatarRarity, AvatarMonetization } from '@/types/avatar';
import { RARITY_CONFIG } from '@/constants/rarity';
import { VoxelRarityBadge } from './VoxelRarityBadge';

interface Props {
  name: string;
  description?: string;
  preview: React.ReactNode;
  rarity?: AvatarRarity;
  monetization?: AvatarMonetization;
  isPurchased?: boolean;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick: () => void;
  onPurchase?: () => void;
  onDetail?: () => void;
  className?: string;
}

/**
 * アイテム選択画面用の汎用カードコンポーネント (レアリティ & Discord直接購入 & 詳細プレビュー対応)
 */
export function SelectionCard({
  name,
  description,
  preview,
  rarity,
  monetization,
  isPurchased = true,
  isSelected,
  isLocked,
  onClick,
  onPurchase,
  onDetail,
  className = ''
}: Props) {
  const rarityConfig = rarity ? RARITY_CONFIG[rarity] : null;

  // 課金アイテムで未購入かどうかの判定
  const needsPurchase = !!(monetization?.isPremium && !isPurchased);

  // 枠線とシャドウのスタイル決定
  let cardStyles = 'bg-slate-900/90 border-slate-700/60 hover:border-slate-500';
  if (isSelected) {
    if (rarityConfig) {
      cardStyles = `bg-slate-900 border-2 ${rarityConfig.glowShadow}`;
    } else {
      cardStyles = 'bg-[#4cc9f0]/20 border-[#4cc9f0] shadow-[4px_4px_0_0_#4cc9f0]';
    }
  } else if (needsPurchase) {
    cardStyles = 'bg-slate-900/90 border border-amber-500/50 hover:border-amber-400';
  } else if (rarityConfig) {
    cardStyles = `bg-slate-900/90 border ${rarityConfig.borderColor} hover:border-opacity-100`;
  }

  return (
    <div 
      className={`relative flex flex-col p-3 transition-all duration-200 ${cardStyles} ${
        isLocked ? 'opacity-50 grayscale' : ''
      } ${className}`}
      style={isSelected && rarityConfig ? {
        borderColor: rarityConfig.color,
      } : undefined}
    >
      {/* Item Preview (3D or Icon) - スポットライト風のラジアルグラデーション背景 */}
      <div className="relative aspect-square mb-3 flex items-center justify-center bg-[radial-gradient(circle_at_center,_#3b485d_0%,_#1e293b_55%,_#090d16_100%)] border border-slate-700/50 shadow-inner overflow-hidden">
        {/* 課金 / プレミアムバッジ (左上) */}
        {monetization?.isPremium && !isLocked && (
          <div className="absolute top-1.5 left-1.5 z-20">
            {needsPurchase ? (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-300 text-black border border-amber-200 shadow-sm">
                💎 {monetization.priceLabel || 'BUY'}
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-emerald-500 text-white border border-emerald-300 shadow-sm">
                ✓ OWNED
              </span>
            )}
          </div>
        )}

        {/* レアリティバッジ (右上) */}
        {rarity && !isLocked && (
          <div className="absolute top-1.5 right-1.5 z-20">
            <VoxelRarityBadge rarity={rarity} size="sm" />
          </div>
        )}

        {/* 詳細プレビューボタン (右下) */}
        {onDetail && !isLocked && (
          <button
            type="button"
            title="アバター詳細・ギミックプレビュー"
            onClick={(e) => {
              e.stopPropagation();
              onDetail();
            }}
            className="absolute bottom-1.5 right-1.5 z-20 w-5 h-5 flex items-center justify-center bg-black/80 hover:bg-[#4cc9f0] hover:text-black text-white/90 text-[11px] font-black border border-white/20 transition-all shadow-md active:scale-90"
            style={{
              clipPath: 'polygon(0 2px, 2px 2px, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0 calc(100% - 2px))'
            }}
          >
            ?
          </button>
        )}

        {!isLocked ? (
          preview
        ) : (
          <span className="text-4xl">🔒</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 mb-1">
        <h3 
          className="font-bold text-[11px] truncate uppercase tracking-tighter"
          style={{ color: rarityConfig ? rarityConfig.textColor : '#ffffff' }}
        >
          {name}
        </h3>
      </div>
      
      {description && (
        <p className="text-white/40 text-[9px] leading-tight h-8 overflow-hidden mb-3">
          {description}
        </p>
      )}

      {/* アクションボタン: 未購入時は「購入」、購入済み・無料時は「選択」 */}
      {needsPurchase ? (
        <VoxelButton 
          disabled={isLocked}
          variant="primary"
          className="w-full !text-[9px] !py-1 !bg-amber-500 !shadow-[0_4px_0_0_#b45309] hover:!bg-amber-400 !text-black"
          onClick={onPurchase}
        >
          BUY {monetization.priceLabel || '$1.99'}
        </VoxelButton>
      ) : (
        <VoxelButton 
          disabled={isLocked || isSelected}
          variant={isSelected ? 'primary' : 'secondary'}
          className="w-full !text-[9px] !py-1"
          style={isSelected && rarityConfig ? {
            backgroundColor: rarityConfig.color,
            boxShadow: `0 4px 0 0 ${rarityConfig.accentColor}`,
          } : undefined}
          onClick={onClick}
        >
          {isSelected ? 'SELECTED' : isLocked ? 'LOCKED' : 'SELECT'}
        </VoxelButton>
      )}
    </div>
  );
}
