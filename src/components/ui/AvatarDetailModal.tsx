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
  cameraPosition = [4.5, 3.5, 4.5],
}: {
  component: React.ComponentType<any>;
  isSitting?: boolean;
  isSpeaking?: boolean;
  autoRotate?: boolean;
  zoom?: number;
  cameraPosition?: [number, number, number];
}) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        orthographic
        camera={{ position: cameraPosition, zoom }}
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
 * モーダルを開いた瞬間に、レア度に応じたギミック枠（2〜4画面）が自動で同時に60FPS動作するマルチビューモーダル。
 * ユーザーのクリックやタブ切り替え操作は一切不要で、レア度が増えるほど豪華なギミック枠が同時に並びます。
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

  const rarity = avatar.rarity;
  const rarityConfig = RARITY_CONFIG[rarity];
  const ModelComponent = avatar.component;
  const needsPurchase = !!(avatar.monetization?.isPremium && !isPurchased);

  // レア度に応じたモーダルの最大幅とグリッドカラム
  const modalMaxWidth =
    rarity === 'common'
      ? 'max-w-3xl md:max-w-4xl'
      : rarity === 'rare'
      ? 'max-w-5xl'
      : 'max-w-6xl';

  const gridColsClass =
    rarity === 'common'
      ? 'grid-cols-1 md:grid-cols-2'
      : rarity === 'rare'
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-4';

  const zoomLevel =
    rarity === 'common' ? 145 : rarity === 'rare' ? 135 : 125;

  return (
    <div className="fixed inset-0 z-[110000] flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className={`relative w-full ${modalMaxWidth} bg-slate-900 border-2 shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
        style={{
          borderColor: rarityConfig.color,
          clipPath: 'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))'
        }}
      >
        {/* ヘッダーバー */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <VoxelRarityBadge rarity={rarity} size="md" />
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              {avatar.name}
            </h2>
            {avatar.monetization?.isPremium && (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-300 text-black border border-amber-200 shadow-sm">
                💎 {avatar.monetization.priceLabel || 'PREMIUM'}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center ml-2 px-2 py-0.5 text-[9px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/30">
              {rarity === 'common' && '2 GIMMICKS'}
              {rarity === 'rare' && '3 GIMMICKS'}
              {rarity === 'epic' && '4 GIMMICKS (+NEON & PARTICLES)'}
              {(rarity === 'legendary' || rarity === 'ultimate') && '4 GIMMICKS (+AURA & RUNES)'}
            </span>
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

        {/* メイン: レア度連動のマルチギミック映像パネル (開いた瞬間にすべて同時に60FPS稼働) */}
        <div className={`p-4 md:p-6 grid ${gridColsClass} gap-3 md:gap-4 bg-slate-950/75 max-h-[72vh] overflow-y-auto`}>
          
          {/* 枠 1: 立ち姿 (STAND POSE) - 全レア度 */}
          <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#334155_0%,_#1e293b_60%,_#090d16_100%)] border border-slate-700/80 shadow-lg overflow-hidden group">
            <div className="px-3 py-2 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-black tracking-wider text-slate-200 uppercase">
                🚶 {rarity === 'legendary' || rarity === 'ultimate' ? 'STAND & HOVER' : 'STAND POSE'}
              </span>
              <span className="text-[9px] text-slate-400 font-bold">360° AUTO</span>
            </div>
            <div className="h-56 md:h-64 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={false}
                isSpeaking={false}
                autoRotate={true}
                zoom={zoomLevel}
              />
            </div>
            <div className="p-2.5 bg-slate-900/90 border-t border-slate-700/60 text-center">
              <p className="text-xs text-slate-300 font-medium">
                {rarity === 'legendary' || rarity === 'ultimate'
                  ? '浮遊ホバリング＆基本立ち姿'
                  : '基本立ち姿（アイドル微呼吸）'}
              </p>
            </div>
          </div>

          {/* 枠 2: 着席ポーズ (SIT POSE) - 全レア度 */}
          <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#1e3a5f_0%,_#0f172a_60%,_#050811_100%)] border border-blue-500/40 shadow-lg overflow-hidden group">
            <div className="px-3 py-2 bg-blue-950/80 border-b border-blue-500/30 flex items-center justify-between">
              <span className="text-xs font-black tracking-wider text-blue-200 uppercase">
                🪑 SIT POSE
              </span>
              <span className="text-[9px] text-blue-300/80 font-bold">SEATED</span>
            </div>
            <div className="h-56 md:h-64 relative">
              <GimmickViewport
                component={ModelComponent}
                isSitting={true}
                isSpeaking={false}
                autoRotate={false}
                zoom={zoomLevel}
              />
            </div>
            <div className="p-2.5 bg-slate-900/90 border-t border-blue-500/30 text-center">
              <p className="text-xs text-blue-200 font-medium">椅子・デスク着席時の専用ポーズ</p>
            </div>
          </div>

          {/* 枠 3: ボイス反応ギミック (VOICE ACTION) - Rare以上 */}
          {rarity !== 'common' && (
            <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#022c22_60%,_#02120e_100%)] border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden group">
              <div className="px-3 py-2 bg-emerald-950/90 border-b border-emerald-500/40 flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-emerald-200 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  🎙️ VOICE ACTION
                </span>
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-900/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  LIVE 60FPS
                </span>
              </div>
              <div className="h-56 md:h-64 relative">
                <GimmickViewport
                  component={ModelComponent}
                  isSitting={false}
                  isSpeaking={true}
                  autoRotate={false}
                  zoom={zoomLevel}
                />
              </div>
              <div className="p-2.5 bg-slate-900/90 border-t border-emerald-500/30 text-center">
                <p className="text-xs text-emerald-300 font-bold">
                  発言連動の身体フィジカルアクション
                </p>
              </div>
            </div>
          )}

          {/* 枠 4 (Epic): ネオン発光＆旋回光粒子 (NEON & PARTICLES) */}
          {rarity === 'epic' && (
            <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#581c87_0%,_#3b0764_60%,_#090514_100%)] border border-purple-500/60 shadow-[0_0_24px_rgba(168,85,247,0.3)] overflow-hidden group">
              <div className="px-3 py-2 bg-purple-950/90 border-b border-purple-500/40 flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-purple-200 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  ✨ NEON & FX
                </span>
                <span className="text-[9px] font-bold text-purple-300 bg-purple-900/80 px-1.5 py-0.5 rounded border border-purple-500/30">
                  EPIC FX
                </span>
              </div>
              <div className="h-56 md:h-64 relative">
                <GimmickViewport
                  component={ModelComponent}
                  isSitting={false}
                  isSpeaking={true}
                  autoRotate={true}
                  zoom={zoomLevel - 10}
                />
              </div>
              <div className="p-2.5 bg-slate-900/90 border-t border-purple-500/30 text-center">
                <p className="text-xs text-purple-200 font-bold">
                  ネオンパルス発光 ＆ 旋回する光粒子
                </p>
              </div>
            </div>
          )}

          {/* 枠 4 (Legendary / Ultimate): 魔法陣オーラ＆全開エナジー (AURA & RUNES) */}
          {(rarity === 'legendary' || rarity === 'ultimate') && (
            <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#831843_0%,_#4c0519_60%,_#14020a_100%)] border border-amber-500/60 shadow-[0_0_28px_rgba(245,158,11,0.3)] overflow-hidden group">
              <div className="px-3 py-2 bg-rose-950/90 border-b border-amber-500/40 flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-amber-200 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  🌀 AURA RUNE
                </span>
                <span className="text-[9px] font-bold text-amber-300 bg-amber-900/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                  MAX FX
                </span>
              </div>
              <div className="h-56 md:h-64 relative">
                <GimmickViewport
                  component={ModelComponent}
                  isSitting={false}
                  isSpeaking={true}
                  autoRotate={true}
                  zoom={zoomLevel - 20}
                  cameraPosition={[4.0, 5.0, 4.0]}
                />
              </div>
              <div className="p-2.5 bg-slate-900/90 border-t border-amber-500/30 text-center">
                <p className="text-xs text-amber-200 font-bold">
                  二重反転魔法陣 ＆ フルオーラ展開
                </p>
              </div>
            </div>
          )}

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
