import React, { Suspense } from 'react';
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
 * 3Dギミックビューポート (ミニ3Dステージ)
 */
function GimmickViewport({
  component: ModelComponent,
  isSitting = false,
  isSpeaking = false,
  autoRotate = false,
  zoom = 42,
}: {
  component: React.ComponentType<any>;
  isSitting?: boolean;
  isSpeaking?: boolean;
  autoRotate?: boolean;
  zoom?: number;
}) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        orthographic
        camera={{ position: [5, 5, 5], zoom }}
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
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={2.0}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * AvatarDetailModal
 * 開いた瞬間に「立ち姿」「着席ポーズ」「発言ギミック」の3つの動く3Dライブ映像が
 * 仕切りで同時に並び、クリック不要で直感的に全てが把握できる詳細モーダル
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
  if (!isOpen) return null;

  const rarityConfig = RARITY_CONFIG[avatar.rarity];
  const ModelComponent = avatar.component;
  const needsPurchase = !!(avatar.monetization?.isPremium && !isPurchased);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border-2 shadow-2xl flex flex-col overflow-hidden"
        style={{
          borderColor: rarityConfig.color,
          clipPath: 'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))'
        }}
      >
        {/* ヘッダーバー */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/40 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <VoxelRarityBadge rarity={avatar.rarity} size="md" />
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              {avatar.name}
            </h2>
            {avatar.monetization?.isPremium && (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-300 text-black border border-amber-200">
                💎 {avatar.monetization.priceLabel || 'PREMIUM'}
              </span>
            )}
          </div>
          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-red-500 text-white font-bold text-sm border border-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* メイン: 3分割の動く3Dギミック映像パネル */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 bg-gradient-to-b from-black/20 to-black/60">
          
          {/* 仕切り 1: 立ち姿 (NORMAL) */}
          <div className="relative flex flex-col bg-black/50 border border-white/15 overflow-hidden group">
            <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-white/80 uppercase">
                🚶 NORMAL POSE
              </span>
              <span className="text-[8px] text-white/40">360° AUTO</span>
            </div>
            {/* 3D映像 */}
            <div className="h-44 md:h-56 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={false}
                isSpeaking={false}
                autoRotate={true}
              />
            </div>
            <div className="p-2 bg-black/40 border-t border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-medium">基本立ち姿（ドラッグで回転）</p>
            </div>
          </div>

          {/* 仕切り 2: 着席ポーズ (SIT POSE) */}
          <div className="relative flex flex-col bg-black/50 border border-blue-500/30 overflow-hidden group">
            <div className="px-3 py-1.5 bg-blue-950/40 border-b border-blue-500/20 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-blue-300 uppercase">
                🪑 SIT POSE
              </span>
              <span className="text-[8px] text-blue-400/60">SEATED</span>
            </div>
            {/* 3D映像 */}
            <div className="h-44 md:h-56 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={true}
                isSpeaking={false}
                autoRotate={false}
              />
            </div>
            <div className="p-2 bg-blue-950/20 border-t border-blue-500/20 text-center">
              <p className="text-[10px] text-blue-200 font-medium">椅子・デスク着席時の専用ポーズ</p>
            </div>
          </div>

          {/* 仕切り 3: ボイス反応ギミック (VOICE ACTION LIVE) */}
          <div className="relative flex flex-col bg-black/50 border border-green-500/40 shadow-[0_0_15px_rgba(74,222,128,0.15)] overflow-hidden group">
            <div className="px-3 py-1.5 bg-green-950/40 border-b border-green-500/30 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-green-300 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                🎙️ VOICE ACTION
              </span>
              <span className="text-[8px] font-bold text-green-400 bg-green-900/60 px-1 py-0.5 rounded">
                LIVE
              </span>
            </div>
            {/* 3D映像 (リアルタイムにパタパタ・羽ばたき・発光！) */}
            <div className="h-44 md:h-56 relative bg-gradient-to-b from-green-950/10 to-transparent">
              <GimmickViewport
                component={ModelComponent}
                isSitting={false}
                isSpeaking={true}
                autoRotate={false}
              />
            </div>
            <div className="p-2 bg-green-950/30 border-t border-green-500/30 text-center">
              <p className="text-[10px] text-green-300 font-bold">
                喋るとリアルタイムにアニメーション！
              </p>
            </div>
          </div>

        </div>

        {/* フッター: アバター説明とアクションボタン */}
        <div className="px-5 py-3.5 bg-black/60 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-300 text-xs text-center md:text-left max-w-md">
            {avatar.description}
          </p>

          <div className="w-full md:w-auto min-w-[200px]">
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
