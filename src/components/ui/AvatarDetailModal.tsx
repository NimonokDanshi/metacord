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
 * 舞台風の円形展示ステージ (ポディウム台座)
 */
function ShowcasePodium({ neonColor = '#38bdf8' }: { neonColor?: string }) {
  return (
    <group position={[0, -0.02, 0]}>
      {/* 台座本体 */}
      <mesh receiveShadow position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.52, 0.56, 0.06, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* ステージ外周のネオンリング (光の輪) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.52, 24]} />
        <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

/**
 * 3Dギミックビューポート (スポットライト＆リムライト付きミニステージ)
 */
function GimmickViewport({
  component: ModelComponent,
  isSitting = false,
  isSpeaking = false,
  autoRotate = false,
  zoom = 38,
  neonColor = '#38bdf8',
}: {
  component: React.ComponentType<any>;
  isSitting?: boolean;
  isSpeaking?: boolean;
  autoRotate?: boolean;
  zoom?: number;
  neonColor?: string;
}) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        orthographic
        camera={{ position: [5, 4.5, 5], zoom }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 全体を明るくする環境光 (黒つぶれ防止) */}
        <ambientLight intensity={1.6} />

        {/* 舞台の上からのメイントップライト */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[512, 512]}
        />

        {/* 背後からのリムライト (輪郭光) - 暗いアバターのシルエットを際立たせる */}
        <directionalLight
          position={[-4, 5, -4]}
          intensity={2.5}
          color="#93c5fd"
        />

        <Suspense fallback={null}>
          <Center top>
            <ModelComponent isSitting={isSitting} isSpeaking={isSpeaking} />
            <ShowcasePodium neonColor={neonColor} />
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
 * スポットライトが当たるステージ上で「立ち姿」「着席ポーズ」「発言ギミック」を
 * 3画面同時に明るくくっきり表示する詳細モーダル
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border-2 shadow-2xl flex flex-col overflow-hidden"
        style={{
          borderColor: rarityConfig.color,
          clipPath: 'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))'
        }}
      >
        {/* ヘッダーバー */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700">
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
            className="w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-red-500 text-white font-bold text-sm border border-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* メイン: 3分割のスポットライト付き3Dギミック映像パネル */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 bg-slate-950/70">
          
          {/* 仕切り 1: 立ち姿 (NORMAL) */}
          <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#334155_0%,_#1e293b_60%,_#090d16_100%)] border border-slate-700/80 shadow-lg overflow-hidden group">
            <div className="px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-slate-200 uppercase">
                🚶 STAND POSE
              </span>
              <span className="text-[8px] text-slate-400">360° AUTO</span>
            </div>
            {/* 3D映像 */}
            <div className="h-44 md:h-56 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={false}
                isSpeaking={false}
                autoRotate={true}
                neonColor="#38bdf8"
              />
            </div>
            <div className="p-2 bg-slate-900/90 border-t border-slate-700/60 text-center">
              <p className="text-[10px] text-slate-300 font-medium">基本立ち姿（ドラッグで360度回転）</p>
            </div>
          </div>

          {/* 仕切り 2: 着席ポーズ (SIT POSE) */}
          <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#1e3a5f_0%,_#0f172a_60%,_#050811_100%)] border border-blue-500/40 shadow-lg overflow-hidden group">
            <div className="px-3 py-1.5 bg-blue-950/70 border-b border-blue-500/30 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-blue-200 uppercase">
                🪑 SIT POSE
              </span>
              <span className="text-[8px] text-blue-300/80">SEATED</span>
            </div>
            {/* 3D映像 */}
            <div className="h-44 md:h-56 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={true}
                isSpeaking={false}
                autoRotate={false}
                neonColor="#60a5fa"
              />
            </div>
            <div className="p-2 bg-slate-900/90 border-t border-blue-500/30 text-center">
              <p className="text-[10px] text-blue-200 font-medium">椅子・デスク着席時の専用ポーズ</p>
            </div>
          </div>

          {/* 仕切り 3: ボイス反応ギミック (VOICE ACTION LIVE) */}
          <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#022c22_60%,_#02120e_100%)] border border-emerald-500/50 shadow-[0_0_18px_rgba(16,185,129,0.2)] overflow-hidden group">
            <div className="px-3 py-1.5 bg-emerald-950/80 border-b border-emerald-500/40 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-emerald-200 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                🎙️ VOICE ACTION
              </span>
              <span className="text-[8px] font-bold text-emerald-300 bg-emerald-900/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                LIVE
              </span>
            </div>
            {/* 3D映像 (リアルタイムにパタパタ・羽ばたき・発光！) */}
            <div className="h-44 md:h-56 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={false}
                isSpeaking={true}
                autoRotate={false}
                neonColor="#34d399"
              />
            </div>
            <div className="p-2 bg-slate-900/90 border-t border-emerald-500/30 text-center">
              <p className="text-[10px] text-emerald-300 font-bold">
                喋るとリアルタイムにアニメーション！
              </p>
            </div>
          </div>

        </div>

        {/* フッター: アバター説明とアクションボタン */}
        <div className="px-5 py-4 bg-slate-900 border-t border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-300 text-xs text-center md:text-left max-w-md">
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
