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
  voiceVolume = 0,
  isShouting = false,
  autoRotate = false,
  zoom = 135,
  cameraPosition = [4.5, 3.5, 4.5],
}: {
  component: React.ComponentType<any>;
  isSitting?: boolean;
  isSpeaking?: boolean;
  voiceVolume?: number;
  isShouting?: boolean;
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
        <ambientLight intensity={isShouting ? 2.4 : 1.8} />

        {/* メイントップライト */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={isShouting ? 3.0 : 2.2}
          castShadow
          shadow-mapSize={[512, 512]}
        />

        {/* 輪郭を際立たせるリムライト */}
        <directionalLight
          position={[-4, 5, -4]}
          intensity={isShouting ? 3.5 : 2.6}
          color={isShouting ? '#ffffff' : '#93c5fd'}
        />

        <Suspense fallback={null}>
          <Center>
            <ModelComponent
              isSitting={isSitting}
              isSpeaking={isSpeaking}
              voiceVolume={voiceVolume}
              isShouting={isShouting}
            />
          </Center>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={isShouting ? 3.0 : 2.0}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * AvatarDetailModal
 * 開いた瞬間に、通常ポーズから「大声時の限界突破演出（OVERDRIVE / MAX ROAR）」までが
 * レア度に応じたマルチビュー（2〜4画面）で同時に60FPS稼働する超迫力詳細モーダル。
 * ユーザーのクリック操作は一切不要で、課金アバターの圧倒的な違いが一目で伝わります。
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
          <div className="flex items-center gap-2.5 flex-wrap">
            <VoxelRarityBadge rarity={rarity} size="md" />
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              {avatar.name}
            </h2>
            {avatar.monetization?.isPremium && (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-300 text-black border border-amber-200 shadow-sm">
                💎 {avatar.monetization.priceLabel || 'PREMIUM'}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 font-bold">
              {rarity === 'common' && '⚡ 2 GIMMICKS (STAND & SIT)'}
              {rarity === 'rare' && '⚡ 3 GIMMICKS (+VOICE REACTION)'}
              {rarity === 'epic' && '🔥 4 GIMMICKS (+MAX SHOUT OVERDRIVE)'}
              {(rarity === 'legendary' || rarity === 'ultimate') && '👑 4 GIMMICKS (+MAX ROAR & TERRITORY)'}
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

          {/* 枠 3: ボイス反応ギミック (VOICE TALK) - Rare以上 */}
          {rarity !== 'common' && (
            <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#022c22_60%,_#02120e_100%)] border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden group">
              <div className="px-3 py-2 bg-emerald-950/90 border-b border-emerald-500/40 flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-emerald-200 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  🎙️ VOICE TALK
                </span>
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-900/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  NORMAL TALK
                </span>
              </div>
              <div className="h-56 md:h-64 relative">
                <GimmickViewport
                  component={ModelComponent}
                  isSitting={false}
                  isSpeaking={true}
                  voiceVolume={0.4}
                  isShouting={false}
                  autoRotate={false}
                  zoom={zoomLevel}
                />
              </div>
              <div className="p-2.5 bg-slate-900/90 border-t border-emerald-500/30 text-center">
                <p className="text-xs text-emerald-300 font-bold">
                  通常会話時のリアクション
                </p>
              </div>
            </div>
          )}

          {/* 枠 4 (Epic): 大声時の限界突破 (MAX SHOUT: OVERDRIVE) */}
          {rarity === 'epic' && (
            <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#701a75_0%,_#4a044e_60%,_#120114_100%)] border-2 border-fuchsia-400/80 shadow-[0_0_32px_rgba(217,70,239,0.45)] overflow-hidden group">
              <div className="px-3 py-2 bg-fuchsia-950/90 border-b border-fuchsia-400/60 flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-fuchsia-100 uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-ping" />
                  ⚡ OVERDRIVE
                </span>
                <span className="text-[9px] font-black text-black bg-gradient-to-r from-fuchsia-300 to-amber-300 px-2 py-0.5 rounded shadow-sm">
                  MAX SHOUT!
                </span>
              </div>
              <div className="h-56 md:h-64 relative">
                <GimmickViewport
                  component={ModelComponent}
                  isSitting={false}
                  isSpeaking={true}
                  voiceVolume={1.0}
                  isShouting={true}
                  autoRotate={true}
                  zoom={zoomLevel - 15}
                />
              </div>
              <div className="p-2.5 bg-slate-900/95 border-t border-fuchsia-500/50 text-center">
                <p className="text-xs text-fuchsia-200 font-black">
                  大声時: 杖を天に掲げ雷光ストロボ＆光粒子嵐！
                </p>
              </div>
            </div>
          )}

          {/* 枠 4 (Legendary / Ultimate): 大声咆哮＆部屋全体領域展開 (MAX ROAR & TERRITORY) */}
          {(rarity === 'legendary' || rarity === 'ultimate') && (
            <div className="relative flex flex-col bg-[radial-gradient(circle_at_center,_#831843_0%,_#3b0764_60%,_#0a0114_100%)] border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] overflow-hidden group">
              <div className="px-3 py-2 bg-gradient-to-r from-amber-950 via-rose-950 to-purple-950 border-b border-amber-400/70 flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-amber-200 uppercase flex items-center gap-1.5 drop-shadow-[0_0_8px_#f59e0b]">
                  <span className="w-3 h-3 rounded-full bg-amber-300 animate-ping" />
                  🌋 ROAR & TERRITORY
                </span>
                <span className="text-[9px] font-black text-black bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 px-2.5 py-0.5 rounded shadow-[0_0_12px_#f59e0b]">
                  MAX ROAR!
                </span>
              </div>
              <div className="h-56 md:h-64 relative">
                <GimmickViewport
                  component={ModelComponent}
                  isSitting={false}
                  isSpeaking={true}
                  voiceVolume={1.0}
                  isShouting={true}
                  autoRotate={true}
                  zoom={95}
                  cameraPosition={[3.6, 3.8, 3.6]}
                />
              </div>
              <div className="p-2.5 bg-slate-900/95 border-t border-amber-500/60 text-center">
                <p className="text-xs text-amber-300 font-black tracking-wide">
                  大声時: 咆哮ビーム放射・巨大翼展開・床全体メガ魔法陣！
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
