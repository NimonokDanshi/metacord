import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls } from '@react-three/drei';
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
 * 3Dギミックビューポート (余分なステージを撤廃し、アバターをドアップで大きく表示)
 */
function GimmickViewport({
  component: ModelComponent,
  isSitting = false,
  isSpeaking = false,
  autoRotate = false,
  zoom = 135,
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
        camera={{ position: [4.5, 3.5, 4.5], zoom }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 全体を明るくする環境光 */}
        <ambientLight intensity={1.8} />

        {/* メイントップライト */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[512, 512]}
        />

        {/* 輪郭を際立たせるリムライト */}
        <directionalLight
          position={[-4, 5, -4]}
          intensity={2.6}
          color="#93c5fd"
        />

        <Suspense fallback={null}>
          <Center>
            <ModelComponent isSitting={isSitting} isSpeaking={isSpeaking} />
          </Center>
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
 * 「立ち姿」「着席ポーズ」「発言ギミック」をドアップかつ迫力あるサイズで3画面同時表示する詳細モーダル
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
    <div className="fixed inset-0 z-[110000] flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border-2 shadow-2xl flex flex-col overflow-hidden"
        style={{
          borderColor: rarityConfig.color,
          clipPath: 'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))'
        }}
      >
        {/* ヘッダーバー */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <VoxelRarityBadge rarity={avatar.rarity} size="md" />
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              {avatar.name}
            </h2>
            {avatar.monetization?.isPremium && (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-300 text-black border border-amber-200 shadow-sm">
                💎 {avatar.monetization.priceLabel || 'PREMIUM'}
              </span>
            )}
          </div>
          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-red-500 text-white font-bold text-sm border border-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* メイン: 3分割の大迫力・近接3Dギミック映像パネル */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/75">
          
          {/* 仕切り 1: 立ち姿 (NORMAL) */}
          <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#334155_0%,_#1e293b_60%,_#090d16_100%)] border border-slate-700/80 shadow-lg overflow-hidden group">
            <div className="px-3 py-2 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-black tracking-wider text-slate-200 uppercase">
                🚶 STAND POSE
              </span>
              <span className="text-[9px] text-slate-400 font-bold">360° AUTO</span>
            </div>
            {/* 3D映像 (ドアップ拡大) */}
            <div className="h-60 md:h-72 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={false}
                isSpeaking={false}
                autoRotate={true}
                zoom={135}
              />
            </div>
            <div className="p-2.5 bg-slate-900/90 border-t border-slate-700/60 text-center">
              <p className="text-xs text-slate-300 font-medium">基本立ち姿（ドラッグで360度回転）</p>
            </div>
          </div>

          {/* 仕切り 2: 着席ポーズ (SIT POSE) */}
          <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#1e3a5f_0%,_#0f172a_60%,_#050811_100%)] border border-blue-500/40 shadow-lg overflow-hidden group">
            <div className="px-3 py-2 bg-blue-950/80 border-b border-blue-500/30 flex items-center justify-between">
              <span className="text-xs font-black tracking-wider text-blue-200 uppercase">
                🪑 SIT POSE
              </span>
              <span className="text-[9px] text-blue-300/80 font-bold">SEATED</span>
            </div>
            {/* 3D映像 (ドアップ拡大) */}
            <div className="h-60 md:h-72 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={true}
                isSpeaking={false}
                autoRotate={false}
                zoom={135}
              />
            </div>
            <div className="p-2.5 bg-slate-900/90 border-t border-blue-500/30 text-center">
              <p className="text-xs text-blue-200 font-medium">椅子・デスク着席時の専用ポーズ</p>
            </div>
          </div>

          {/* 仕切り 3: ボイス反応ギミック (VOICE ACTION LIVE) */}
          <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#022c22_60%,_#02120e_100%)] border border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.25)] overflow-hidden group">
            <div className="px-3 py-2 bg-emerald-950/90 border-b border-emerald-500/40 flex items-center justify-between">
              <span className="text-xs font-black tracking-wider text-emerald-200 uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                🎙️ VOICE ACTION
              </span>
              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                LIVE 60FPS
              </span>
            </div>
            {/* 3D映像 (ドアップ拡大) */}
            <div className="h-60 md:h-72 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={false}
                isSpeaking={true}
                autoRotate={false}
                zoom={135}
              />
            </div>
            <div className="p-2.5 bg-slate-900/90 border-t border-emerald-500/30 text-center">
              <p className="text-xs text-emerald-300 font-bold">
                喋るとリアルタイムにアニメーション！
              </p>
            </div>
          </div>

        </div>

        {/* フッター: アバター説明とアクションボタン */}
        <div className="px-5 py-4 bg-slate-900 border-t border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-300 text-sm text-center md:text-left max-w-lg">
            {avatar.description}
          </p>

          <div className="w-full md:w-auto min-w-[220px]">
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
