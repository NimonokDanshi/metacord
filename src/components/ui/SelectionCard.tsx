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
 * アイテム選択画面用の大判カードコンポーネント (4x1 スクロール対応)
 * バッジや詳細ボタンを上部バーに独立配置し、アバター3Dモデルとの被りを完全防止
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
    cardStyles = 'bg-slate-900/90 border border-amber-500/60 hover:border-amber-400';
  } else if (rarityConfig) {
    cardStyles = `bg-slate-900/90 border ${rarityConfig.borderColor} hover:border-opacity-100`;
  }

  return (
    <div 
      className={`relative flex flex-col p-3 transition-all duration-200 select-none ${cardStyles} ${
        isLocked ? 'opacity-50 grayscale' : ''
      } ${className}`}
      style={isSelected && rarityConfig ? {
        borderColor: rarityConfig.color,
      } : undefined}
    >
      {/* カードヘッダー部: レアリティバッジ / プレミアムタグ / 詳細？ボタンを独立配置 (被り解消) */}
      <div className="flex items-center justify-between gap-1 mb-2 h-6">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {rarity && !isLocked && (
            <VoxelRarityBadge rarity={rarity} size="sm" />
          )}
          {monetization?.isPremium && !isLocked && (
            needsPurchase ? (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-300 text-black border border-amber-200 shadow-sm">
                💎 {monetization.priceLabel || 'BUY'}
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-emerald-500 text-white border border-emerald-300 shadow-sm">
                ✓ OWNED
              </span>
            )
          )}
        </div>

        {/* 詳細プレビュー「？」ボタン (ヘッダー右端に配置して被りゼロへ) */}
        {onDetail && !isLocked && (
          <button
            type="button"
            title="アバター詳細・ギミックプレビュー"
            onClick={(e) => {
              e.stopPropagation();
              onDetail();
            }}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-[#4cc9f0] hover:text-black text-cyan-400 text-xs font-black border border-cyan-500/50 transition-all shadow-md active:scale-95"
            style={{
              clipPath: 'polygon(0 2px, 2px 2px, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0 calc(100% - 2px))'
            }}
          >
            ?
          </button>
        )}
      </div>

      {/* Item Preview (3D Viewport) - アバター全体がスポットライトで輝くプレビュー */}
      <div className="relative aspect-square mb-2.5 flex items-center justify-center bg-[radial-gradient(circle_at_center,_#384c6e_0%,_#1e293b_55%,_#090d16_100%)] border border-slate-700/60 shadow-inner overflow-hidden">
        {!isLocked ? (
          preview
        ) : (
          <span className="text-4xl select-none">🔒</span>
        )}
      </div>

      {/* アバター名 */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <h3 
          className="font-bold text-xs truncate uppercase tracking-tight"
          style={{ color: rarityConfig ? rarityConfig.textColor : '#ffffff' }}
        >
          {name}
        </h3>
      </div>
      
      {/* 説明文 */}
      {description && (
        <p className="text-white/50 text-[10px] leading-tight h-8 overflow-hidden mb-2.5">
          {description}
        </p>
      )}

      {/* アクションボタン */}
      {needsPurchase ? (
        <VoxelButton 
          disabled={isLocked}
          variant="primary"
          className="w-full !text-[10px] !py-1.5 !bg-amber-500 !shadow-[0_4px_0_0_#b45309] hover:!bg-amber-400 !text-black font-black"
          onClick={onPurchase}
        >
          BUY {monetization.priceLabel || '$1.99'}
        </VoxelButton>
      ) : (
        <VoxelButton 
          disabled={isLocked || isSelected}
          variant={isSelected ? 'primary' : 'secondary'}
          className="w-full !text-[10px] !py-1.5 font-bold"
          style={isSelected && rarityConfig ? {
            backgroundColor: rarityConfig.color,
            boxShadow: `0 4px 0 0 ${rarityConfig.accentColor}`,
          } : undefined}
          onClick={onClick}
        >
          {isSelected ? 'EQUIPPED' : isLocked ? 'LOCKED' : 'EQUIP'}
        </VoxelButton>
      )}
    </div>
  );
}
