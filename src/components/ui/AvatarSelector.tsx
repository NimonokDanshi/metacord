import React, { useState, useEffect } from 'react';
import { useDiscordStore } from '@/stores/discordStore';
import { useMonetizationStore } from '@/stores/monetizationStore';
import { monetizationActions } from '@/actions/monetizationActions';
import { AvatarType } from '@/types/room';
import { AVATAR_REGISTRY } from '@/constants/avatarRegistry';
import { AvatarMetadata, AvatarRarity } from '@/types/avatar';
import { AvatarPreview } from './AvatarPreview';
import { SelectionGrid } from './SelectionGrid';
import { SelectionCard } from './SelectionCard';
import { AvatarDetailModal } from './AvatarDetailModal';
import { roomActions } from '@/actions/roomActions';

const ITEMS_PER_PAGE = 4;
const COMING_SOON_RARITIES: AvatarRarity[] = ['epic', 'legendary', 'ultimate', 'rare', 'common'];

export function AvatarSelector() {
  const { avatarType } = useDiscordStore();
  const { isPurchased } = useMonetizationStore();
  const [detailAvatar, setDetailAvatar] = useState<AvatarMetadata | null>(null);

  // 表示用アバターリストの生成 (4の倍数になるよう Coming soon で埋めて綺麗な4枚グリッドを維持)
  const displayAvatars = [...AVATAR_REGISTRY];
  let placeholderIndex = 0;
  const remainder = displayAvatars.length % ITEMS_PER_PAGE;
  if (remainder !== 0) {
    const needCount = ITEMS_PER_PAGE - remainder;
    for (let i = 0; i < needCount; i++) {
      const rarity = COMING_SOON_RARITIES[placeholderIndex % COMING_SOON_RARITIES.length];
      displayAvatars.push({
        id: `locked-${placeholderIndex}` as AvatarType,
        name: 'Coming soon...',
        description: `${rarity.toUpperCase()} avatar under development.`,
        rarity,
        component: () => null
      });
      placeholderIndex++;
    }
  }

  const totalPages = Math.max(1, Math.ceil(displayAvatars.length / ITEMS_PER_PAGE));

  // 選択中のアバターが存在するページを初期表示に設定
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const selectedIdx = displayAvatars.findIndex(a => a.id === avatarType);
    if (selectedIdx !== -1) {
      return Math.floor(selectedIdx / ITEMS_PER_PAGE);
    }
    return 0;
  });

  const safePage = Math.min(Math.max(0, currentPage), totalPages - 1);
  const currentAvatars = displayAvatars.slice(
    safePage * ITEMS_PER_PAGE,
    (safePage + 1) * ITEMS_PER_PAGE
  );

  // 左右キーボードでのページ送り対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // モーダル詳細が開いている時はページ送りを抑制
      if (detailAvatar) return;

      if (e.key === 'ArrowLeft') {
        setCurrentPage(p => Math.max(0, p - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(p => Math.min(totalPages - 1, p + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, detailAvatar]);

  const handleSelect = async (type: AvatarType) => {
    await roomActions.updateAvatar(type);
  };

  const handlePurchase = async (skuId: string, name: string, type: AvatarType) => {
    const success = await monetizationActions.purchaseAvatar(skuId, name);
    if (success) {
      // 購入完了後、自動でそのアバターを選択
      await roomActions.updateAvatar(type);
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* 4x1 ページグリッド (スクロール無効化で1画面にスッキリ収まる) */}
      <SelectionGrid scrollable={false}>
        {currentAvatars.map((avatar, index) => {
          const isSelected = avatarType === avatar.id;
          const isLocked = avatar.id.startsWith('locked');
          const skuId = avatar.monetization?.skuId;
          const purchased = isPurchased(skuId);

          return (
            <SelectionCard
              key={`${avatar.id}-${index}`}
              name={avatar.name}
              description={avatar.description}
              rarity={avatar.rarity}
              monetization={avatar.monetization}
              isPurchased={purchased}
              preview={!isLocked ? <AvatarPreview component={avatar.component} /> : null}
              isSelected={isSelected}
              isLocked={isLocked}
              onClick={() => handleSelect(avatar.id)}
              onPurchase={skuId ? () => handlePurchase(skuId, avatar.name, avatar.id) : undefined}
              onDetail={!isLocked ? () => setDetailAvatar(avatar) : undefined}
            />
          );
        })}
      </SelectionGrid>

      {/* ボクセルスタイル ページネーション コントロールバー */}
      <div className="flex items-center justify-between px-2 py-2.5 bg-slate-900/80 border-2 border-[#4361ee]/60 shadow-[4px_4px_0_0_#4361ee]/40">
        {/* 前へボタン */}
        <button
          type="button"
          disabled={safePage === 0}
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all border-2 ${
            safePage === 0
              ? 'bg-slate-800/40 border-slate-700/40 text-slate-500 cursor-not-allowed'
              : 'bg-[#4cc9f0] hover:bg-cyan-300 text-black border-cyan-200 shadow-[2px_2px_0_0_#4361ee] active:translate-x-0.5 active:translate-y-0.5'
          }`}
          style={{
            clipPath: 'polygon(0 2px, 2px 2px, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0 calc(100% - 2px))'
          }}
        >
          <span>◀</span>
          <span>PREV</span>
        </button>

        {/* ページインジケーター ＆ ドット */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPage(i)}
                title={`Go to page ${i + 1}`}
                className={`transition-all duration-200 ${
                  safePage === i
                    ? 'w-6 h-2.5 bg-[#4cc9f0] shadow-[0_0_8px_#4cc9f0]'
                    : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
                style={{
                  clipPath: 'polygon(0 1px, 1px 1px, 1px 0, calc(100% - 1px) 0, calc(100% - 1px) 1px, 100% 1px, 100% calc(100% - 1px), calc(100% - 1px) calc(100% - 1px), calc(100% - 1px) 100%, 1px 100%, 1px calc(100% - 1px), 0 calc(100% - 1px))'
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-black text-cyan-300 tracking-widest font-mono drop-shadow-[1px_1px_0_#000]">
            PAGE {safePage + 1} / {totalPages}
          </span>
        </div>

        {/* 次へボタン */}
        <button
          type="button"
          disabled={safePage >= totalPages - 1}
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all border-2 ${
            safePage >= totalPages - 1
              ? 'bg-slate-800/40 border-slate-700/40 text-slate-500 cursor-not-allowed'
              : 'bg-[#4cc9f0] hover:bg-cyan-300 text-black border-cyan-200 shadow-[2px_2px_0_0_#4361ee] active:translate-x-0.5 active:translate-y-0.5'
          }`}
          style={{
            clipPath: 'polygon(0 2px, 2px 2px, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0 calc(100% - 2px))'
          }}
        >
          <span>NEXT</span>
          <span>▶</span>
        </button>
      </div>

      {/* アバター詳細＆ギミックテストモーダル */}
      {detailAvatar && (
        <AvatarDetailModal
          avatar={detailAvatar}
          isOpen={!!detailAvatar}
          isSelected={avatarType === detailAvatar.id}
          isPurchased={isPurchased(detailAvatar.monetization?.skuId)}
          onClose={() => setDetailAvatar(null)}
          onSelect={() => handleSelect(detailAvatar.id)}
          onPurchase={detailAvatar.monetization?.skuId
            ? () => handlePurchase(detailAvatar.monetization!.skuId!, detailAvatar.name, detailAvatar.id)
            : undefined}
        />
      )}
    </div>
  );
}
