import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stage, Center, OrbitControls } from '@react-three/drei';
import { AvatarMetadata } from '@/types/avatar';
import { RARITY_CONFIG } from '@/constants/rarity';
import { VoxelRarityBadge } from './VoxelRarityBadge';
import { VoxelButton } from './VoxelButton';

interface Props {
  avatar: AvatarMetadata;
  isOpen: boolean;
  isSelected?: boolean;
  isPurchased?: boolean;
  onClose: () => void;
  onSelect: () => void;
  onPurchase?: () => void;
}

/**
 * AvatarDetailModal
 * アバターの3Dモデルを360度回転して観察でき、
 * 着席ポーズやボイス反応ギミックをリアルタイムにテストできる詳細モーダル
 */
export function AvatarDetailModal({
  avatar,
  isOpen,
  isSelected,
  isPurchased = true,
  onClose,
  onSelect,
  onPurchase,
}: Props) {
  const [isSitting, setIsSitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const rarityConfig = RARITY_CONFIG[avatar.rarity];
  const ModelComponent = avatar.component;
  const needsPurchase = !!(avatar.monetization?.isPremium && !isPurchased);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border-2 shadow-2xl flex flex-col md:flex-row overflow-hidden"
        style={{
          borderColor: rarityConfig.color,
          clipPath: 'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))'
        }}
      >
        {/* 閉じるボタン (右上) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center bg-black/60 hover:bg-red-500 text-white font-bold text-sm border border-white/20 transition-colors"
        >
          ✕
        </button>

        {/* 左側: インタラクティブ 3D ビューア */}
        <div className="relative w-full md:w-1/2 h-64 md:h-96 bg-black/50 border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center justify-center">
          {/* 3D Canvas */}
          <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas
              shadows
              orthographic
              camera={{ position: [5, 5, 5], zoom: 45 }}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <Stage
                  intensity={1.0}
                  environment={null}
                  adjustCamera={1.2}
                  shadows="contact"
                >
                  <Center>
                    <ModelComponent isSitting={isSitting} isSpeaking={isSpeaking} />
                  </Center>
                </Stage>
                {/* 360度ドラッグ回転可能 */}
                <OrbitControls enableZoom={true} enablePan={false} autoRotate={!isSitting && !isSpeaking} autoRotateSpeed={1.5} />
              </Suspense>
            </Canvas>
          </div>

          {/* 3Dドラッグ案内ガイド */}
          <div className="absolute top-3 left-3 pointer-events-none text-[9px] text-white/40 tracking-wider">
            ↻ DRAG TO ROTATE
          </div>

          {/* ギミックテスト用トグルバー (下部) */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-2 z-20">
            {/* 着席ポーズトグル */}
            <button
              type="button"
              onClick={() => setIsSitting(!isSitting)}
              className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border transition-all ${
                isSitting
                  ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                  : 'bg-black/60 text-white/70 border-white/20 hover:border-white/50'
              }`}
            >
              🪑 {isSitting ? '座りポーズ: ON' : '座りポーズ'}
            </button>

            {/* ボイス反応トグル */}
            <button
              type="button"
              onClick={() => setIsSpeaking(!isSpeaking)}
              className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border transition-all ${
                isSpeaking
                  ? 'bg-green-600 text-white border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse'
                  : 'bg-black/60 text-white/70 border-white/20 hover:border-white/50'
              }`}
            >
              🎙️ {isSpeaking ? '発言中: ON' : '発言テスト'}
            </button>
          </div>
        </div>

        {/* 右側: アバター情報 & アクション */}
        <div className="w-full md:w-1/2 p-5 flex flex-col justify-between">
          <div>
            {/* ランクバッジ & プレミアムバッジ */}
            <div className="flex items-center gap-2 mb-2">
              <VoxelRarityBadge rarity={avatar.rarity} size="md" />
              {avatar.monetization?.isPremium && (
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-300 text-black border border-amber-200">
                  💎 {avatar.monetization.priceLabel || 'PREMIUM'}
                </span>
              )}
            </div>

            {/* アバター名 */}
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
              {avatar.name}
            </h2>

            {/* 説明文 */}
            <p className="text-gray-300 text-xs leading-relaxed mb-4">
              {avatar.description}
            </p>

            {/* ギミック・特徴リスト */}
            {avatar.features && avatar.features.length > 0 && (
              <div className="bg-black/40 border border-white/10 p-3 mb-4">
                <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
                  ✨ FEATURES & GIMMICKS
                </h4>
                <ul className="space-y-1.5">
                  {avatar.features.map((feature, i) => (
                    <li key={i} className="text-xs text-white/90 flex items-start gap-1.5">
                      <span className="text-amber-400 text-[10px]">▶</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="pt-3 border-t border-white/10">
            {needsPurchase ? (
              <VoxelButton
                variant="primary"
                className="w-full !py-2.5 !bg-amber-500 !shadow-[0_4px_0_0_#b45309] hover:!bg-amber-400 !text-black font-black"
                onClick={() => {
                  onPurchase?.();
                  onClose();
                }}
              >
                BUY {avatar.monetization?.priceLabel || '$1.99'}
              </VoxelButton>
            ) : (
              <VoxelButton
                disabled={isSelected}
                variant={isSelected ? 'secondary' : 'primary'}
                className="w-full !py-2.5 font-black"
                style={!isSelected ? {
                  backgroundColor: rarityConfig.color,
                  boxShadow: `0 4px 0 0 ${rarityConfig.accentColor}`,
                } : undefined}
                onClick={() => {
                  onSelect();
                  onClose();
                }}
              >
                {isSelected ? 'CURRENTLY EQUIPPED' : 'WEAR THIS AVATAR'}
              </VoxelButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
