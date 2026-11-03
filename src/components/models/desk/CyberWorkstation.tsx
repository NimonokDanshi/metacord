import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FurnitureModelProps } from '@/types/furniture';
import { HEIGHT_DESK, HEIGHT_CHAIR_SEAT } from '@/constants/voxel';

/**
 * Legendary サイバー・コックピットステーション (CyberWorkstation)
 * - レアリティ: LEGENDARY
 * - ボイス連動イコライザー & ネオンパルス (voiceVolume に応じて発光・伸縮)
 * - 大声シャウト (isShouting) 時にデュアルロケットスラスター点火 ＆ 空中ホバリング打ち上がり！
 */
export function CyberWorkstation({
  pos = { x: 0, y: 0, z: 0 },
  rotation = 0,
  isOccupied = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: FurnitureModelProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const flameLeftRef = useRef<THREE.Group>(null);
  const flameRightRef = useRef<THREE.Group>(null);
  const eqBarsRef = useRef<(THREE.Mesh | null)[]>([]);
  const hoverOffsetRef = useRef<number>(0);

  // フレームごとのボイス連動アニメーション
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // 1. シャウト時のロケット噴射 & 上昇ホバリング
    if (isShouting) {
      // 上空へ一気にリフトオフ (目標 y = 1.2 付近で激しくホバリング)
      hoverOffsetRef.current = THREE.MathUtils.lerp(hoverOffsetRef.current, 1.25, delta * 8);
    } else if (isSpeaking) {
      // 通常発言時は微小な反重力フロート (y = 0.08)
      hoverOffsetRef.current = THREE.MathUtils.lerp(hoverOffsetRef.current, 0.08, delta * 5);
    } else {
      // 待機時は接地 (y = 0)
      hoverOffsetRef.current = THREE.MathUtils.lerp(hoverOffsetRef.current, 0, delta * 6);
    }

    if (rootGroupRef.current) {
      // ロケット噴射中のエンジン小刻み振動
      const shake = isShouting ? (Math.random() - 0.5) * 0.04 : 0;
      rootGroupRef.current.position.y = pos.y + hoverOffsetRef.current + shake;
      // シャウト時は少し前傾チルト
      rootGroupRef.current.rotation.x = isShouting ? Math.sin(t * 12) * 0.03 - 0.04 : 0;
    }

    // 2. ロケット炎エフェクトの伸縮・明滅
    const flameScale = isShouting 
      ? 1.0 + Math.sin(t * 35) * 0.35 + Math.random() * 0.2
      : isSpeaking 
      ? 0.25 + (voiceVolume * 0.4) 
      : 0;

    if (flameLeftRef.current) {
      flameLeftRef.current.scale.set(flameScale, flameScale * 1.5, flameScale);
      flameLeftRef.current.visible = flameScale > 0.05;
    }
    if (flameRightRef.current) {
      flameRightRef.current.scale.set(flameScale, flameScale * 1.5, flameScale);
      flameRightRef.current.visible = flameScale > 0.05;
    }

    // 3. ボイス連動イコライザーバーの上下
    eqBarsRef.current.forEach((bar, idx) => {
      if (!bar) return;
      if (isSpeaking) {
        const factor = Math.sin(t * 18 + idx * 1.3) * 0.5 + 0.5;
        const targetScaleY = Math.max(0.1, (voiceVolume * 1.8 + 0.2) * factor * (isShouting ? 2.2 : 1.2));
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetScaleY, delta * 20);
      } else {
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, 0.1, delta * 8);
      }
    });
  });

  // ネオンカラー (音量やシャウトに応じてシアン ➔ マゼンタ ➔ ゴールド)
  const neonColor = isShouting ? '#ff007f' : isSpeaking ? '#00f0ff' : '#00a8ff';
  const accentColor = isShouting ? '#ffd700' : '#a855f7';

  return (
    <group ref={rootGroupRef} position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      {/* ===================== デスクベース & 天板 ===================== */}
      {/* メインブラックカーボン天板 */}
      <mesh castShadow receiveShadow position={[0, HEIGHT_DESK - 0.04, 0]}>
        <boxGeometry args={[1.9, 0.08, 0.9]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 天板エッジのRGBネオンストリップ */}
      <mesh position={[0, HEIGHT_DESK - 0.04, 0.455]}>
        <boxGeometry args={[1.92, 0.04, 0.02]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
      <mesh position={[-0.955, HEIGHT_DESK - 0.04, 0]}>
        <boxGeometry args={[0.02, 0.04, 0.92]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
      <mesh position={[0.955, HEIGHT_DESK - 0.04, 0]}>
        <boxGeometry args={[0.02, 0.04, 0.92]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>

      {/* サイバー脚部フレーム (Z字型) */}
      {[-0.82, 0.82].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh castShadow position={[0, (HEIGHT_DESK - 0.08) / 2, 0]}>
            <boxGeometry args={[0.08, HEIGHT_DESK - 0.08, 0.7]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* 脚部ネオンライン */}
          <mesh position={[x > 0 ? 0.042 : -0.042, (HEIGHT_DESK - 0.08) / 2, 0]}>
            <boxGeometry args={[0.01, HEIGHT_DESK - 0.1, 0.5]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
          <mesh castShadow position={[0, 0.04, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.85]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}

      {/* ===================== トリプルカーブドモニター ===================== */}
      <group position={[0, HEIGHT_DESK, -0.15]}>
        {/* モニターアーム */}
        <mesh castShadow position={[0, 0.25, -0.1]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 0.35, -0.05]}>
          <boxGeometry args={[1.2, 0.06, 0.06]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* センタースクリーン (超ワイド) */}
        <group position={[0, 0.35, 0]}>
          <mesh castShadow position={[0, 0, -0.02]}>
            <boxGeometry args={[0.8, 0.42, 0.04]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          {/* 画面発光面 */}
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.76, 0.38]} />
            <meshBasicMaterial color={isSpeaking ? (isShouting ? '#ff007f' : '#00f0ff') : '#1e1b4b'} />
          </mesh>
        </group>

        {/* 左側カーブドスクリーン */}
        <group position={[-0.45, 0.35, 0.06]} rotation={[0, 0.35, 0]}>
          <mesh castShadow position={[0, 0, -0.02]}>
            <boxGeometry args={[0.42, 0.42, 0.04]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.38, 0.38]} />
            <meshBasicMaterial color={isSpeaking ? '#8b5cf6' : '#090d16'} />
          </mesh>
        </group>

        {/* 右側カーブドスクリーン */}
        <group position={[0.45, 0.35, 0.06]} rotation={[0, -0.35, 0]}>
          <mesh castShadow position={[0, 0, -0.02]}>
            <boxGeometry args={[0.42, 0.42, 0.04]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.38, 0.38]} />
            <meshBasicMaterial color={isSpeaking ? '#ec4899' : '#090d16'} />
          </mesh>
        </group>
      </group>

      {/* ===================== ボイス連動イコライザーHUD ===================== */}
      {/* モニターの前に浮かぶホログラム音量バー (5本) */}
      <group position={[0, HEIGHT_DESK + 0.62, -0.15]}>
        {[-0.2, -0.1, 0, 0.1, 0.2].map((x, idx) => (
          <mesh
            key={idx}
            ref={(el) => { eqBarsRef.current[idx] = el; }}
            position={[x, 0, 0]}
          >
            <boxGeometry args={[0.04, 0.15, 0.02]} />
            <meshBasicMaterial color={idx === 2 ? '#ff007f' : (idx === 1 || idx === 3) ? '#ffd700' : '#00f0ff'} />
          </mesh>
        ))}
      </group>

      {/* ===================== キーボード & マウス & ゲーミングPC ===================== */}
      <group position={[0, HEIGHT_DESK, 0.2]}>
        {/* RGBキーボード */}
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[0.45, 0.02, 0.16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.026, 0]}>
          <planeGeometry args={[0.43, 0.14]} />
          <meshBasicMaterial color={isSpeaking ? '#00f0ff' : '#4338ca'} />
        </mesh>

        {/* ゲーミングマウス */}
        <mesh position={[0.35, 0.018, 0.02]}>
          <boxGeometry args={[0.07, 0.03, 0.12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.35, 0.034, 0.02]}>
          <boxGeometry args={[0.02, 0.005, 0.06]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* 水冷フルタワーPCケース */}
        <group position={[0.72, 0.22, -0.2]}>
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.22, 0.44, 0.42]} />
            <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* ガラスパネル発光内部 */}
          <mesh position={[-0.112, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.38, 0.38]} />
            <meshBasicMaterial color={isSpeaking ? (isShouting ? '#ff0055' : '#00e5ff') : '#312e81'} />
          </mesh>
        </group>
      </group>

      {/* ===================== セットのサイバーチェア ===================== */}
      <group position={[0.5, 0, 1.2]} rotation={[0, Math.PI, 0]}>
        {/* 座面 */}
        <mesh castShadow receiveShadow position={[0, HEIGHT_CHAIR_SEAT - 0.04, 0]}>
          <boxGeometry args={[0.56, 0.08, 0.54]} />
          <meshStandardMaterial color="#0b0f19" />
        </mesh>
        <mesh position={[0, HEIGHT_CHAIR_SEAT - 0.03, 0.26]}>
          <boxGeometry args={[0.54, 0.03, 0.02]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>

        {/* バケットシート背もたれ */}
        <mesh castShadow position={[0, HEIGHT_CHAIR_SEAT + 0.38, -0.22]}>
          <boxGeometry args={[0.5, 0.72, 0.1]} />
          <meshStandardMaterial color="#0b0f19" />
        </mesh>
        {/* 背もたれのネオンストライプ */}
        <mesh position={[0, HEIGHT_CHAIR_SEAT + 0.38, -0.16]}>
          <boxGeometry args={[0.1, 0.6, 0.02]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* チェア脚部 */}
        <mesh castShadow position={[0, (HEIGHT_CHAIR_SEAT - 0.08) / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, HEIGHT_CHAIR_SEAT - 0.08, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
      </group>

      {/* ===================== デュアル・ロケットスラスター (背部エンジン) ===================== */}
      {/* デスク背面に配置された大型推進バーニア */}
      {[-0.55, 0.55].map((x, idx) => (
        <group key={idx} position={[x, HEIGHT_DESK * 0.5, -0.45]}>
          {/* バーニアノズル本体 */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.19, 0.28, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.14]}>
            <ringGeometry args={[0.08, 0.14, 16]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>

          {/* 噴射炎 (シャウト時・発言時に点火) */}
          <group 
            ref={idx === 0 ? flameLeftRef : flameRightRef} 
            position={[0, -0.05, -0.28]} 
            rotation={[Math.PI / 2, 0, 0]}
          >
            {/* コア炎 (ホワイト・イエロー) */}
            <mesh position={[0, 0.2, 0]}>
              <coneGeometry args={[0.12, 0.45, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* 外周プラズマ炎 (シアン/マゼンタ) */}
            <mesh position={[0, 0.35, 0]}>
              <coneGeometry args={[0.18, 0.75, 8]} />
              <meshBasicMaterial color={isShouting ? '#ff007f' : '#00f0ff'} transparent opacity={0.85} />
            </mesh>
            {/* ショックダイヤモンド風リング */}
            <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.15, 0.22, 12]} />
              <meshBasicMaterial color="#ffd700" />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
