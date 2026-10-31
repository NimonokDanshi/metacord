import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';
import { AvatarRarityEffects } from '@/components/models/avatars/common/AvatarRarityEffects';

/**
 * RetroCosmoBotModel (Rare)
 * レトロフューチャーな白とグレーの宇宙服ボクセルロボット
 * - 発言時 (isSpeaking = true): 頭のアンテナランプが点滅し、体がピコピコ上下に弾む
 * - 着席時 (isSitting = true): 足を前に曲げて着席
 */
export function RetroCosmoBotModel({
  color = '#f8fafc',          // 宇宙服ホワイト
  skinColor = '#475569',      // インナースレートグレー
  accentColor = '#ef4444',    // アンテナ＆インジケーターの警告レッド
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const antennaMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const meterMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const metalColor = '#94a3b8';
  const visorColor = '#38bdf8';
  const chestGreen = '#22c55e';
  const chestYellow = '#eab308';

  // アニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (isSpeaking) {
      // 体がピコピコ上下に弾む (ロボットらしいステップ)
      const bounce = Math.abs(Math.sin(t * 14)) * 0.035;
      if (rootGroupRef.current) {
        rootGroupRef.current.position.y = bounce;
      }

      // アンテナランプの高速点滅 (18Hz)
      const blink = (Math.sin(t * 18) > 0 ? 1 : 0.1) * 3.0;
      if (antennaMatRef.current) {
        antennaMatRef.current.emissiveIntensity = blink;
      }

      // 計器パネルのパルス
      if (meterMatRef.current) {
        meterMatRef.current.emissiveIntensity = Math.sin(t * 10) * 1.0 + 1.5;
      }

      // 腕のピコピコ動作
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * 12) * 0.25;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.sin(t * 12) * 0.25;
      }
    } else {
      if (rootGroupRef.current) {
        rootGroupRef.current.position.y = 0;
      }
      if (antennaMatRef.current) {
        antennaMatRef.current.emissiveIntensity = 0.8;
      }
      if (meterMatRef.current) {
        meterMatRef.current.emissiveIntensity = 1.0;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = 0;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group>
      {/* 弾むアニメーション対象のメイングループ */}
      <group ref={rootGroupRef}>
        {/* 胴体 (Cosmo Torso) */}
        <mesh name="Torso" castShadow position={[0, 0.38, 0]}>
          <boxGeometry args={[0.38, 0.36, 0.28]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>

        {/* 襟元リング (Neck Collar Ring) */}
        <mesh castShadow position={[0, 0.57, 0]}>
          <boxGeometry args={[0.32, 0.04, 0.30]} />
          <meshStandardMaterial color={metalColor} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* 胸元計器パネル (Control Panel) */}
        <group position={[0, 0.40, 0.145]}>
          {/* パネル台座 */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.20, 0.03]} />
            <meshStandardMaterial color={skinColor} metalness={0.5} roughness={0.4} />
          </mesh>

          {/* 計器スクリーン/レトロゲージ */}
          <mesh position={[0, 0.045, 0.016]}>
            <boxGeometry args={[0.18, 0.06, 0.01]} />
            <meshStandardMaterial
              ref={meterMatRef}
              color={visorColor}
              emissive={visorColor}
              emissiveIntensity={1.0}
            />
          </mesh>

          {/* レトロインジケーターランプ群 */}
          {/* 赤ランプ */}
          <mesh position={[-0.07, -0.045, 0.016]}>
            <boxGeometry args={[0.035, 0.035, 0.01]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={isSpeaking ? 2.5 : 0.8}
            />
          </mesh>
          {/* 黄ランプ */}
          <mesh position={[0, -0.045, 0.016]}>
            <boxGeometry args={[0.035, 0.035, 0.01]} />
            <meshStandardMaterial
              color={chestYellow}
              emissive={chestYellow}
              emissiveIntensity={1.0}
            />
          </mesh>
          {/* 緑ランプ */}
          <mesh position={[0.07, -0.045, 0.016]}>
            <boxGeometry args={[0.035, 0.035, 0.01]} />
            <meshStandardMaterial
              color={chestGreen}
              emissive={chestGreen}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>

        {/* 背中: 2連酸素ボンベ / 小型ジェットパック */}
        <group position={[0, 0.38, -0.16]}>
          {/* パック土台マウント */}
          <mesh castShadow position={[0, 0, 0.02]}>
            <boxGeometry args={[0.28, 0.22, 0.04]} />
            <meshStandardMaterial color={skinColor} metalness={0.6} />
          </mesh>

          {/* 左酸素ボンベ */}
          <group position={[-0.08, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 0.28, 0.09]} />
              <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* 上部バルブ金具 */}
            <mesh castShadow position={[0, 0.15, 0]}>
              <boxGeometry args={[0.06, 0.03, 0.06]} />
              <meshStandardMaterial color={metalColor} metalness={0.8} />
            </mesh>
            {/* 下部スラスターノズル */}
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[0.07, 0.03, 0.07]} />
              <meshStandardMaterial
                color="#f97316"
                emissive="#f97316"
                emissiveIntensity={isSpeaking ? 2.0 : 0.8}
              />
            </mesh>
          </group>

          {/* 右酸素ボンベ */}
          <group position={[0.08, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 0.28, 0.09]} />
              <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* 上部バルブ金具 */}
            <mesh castShadow position={[0, 0.15, 0]}>
              <boxGeometry args={[0.06, 0.03, 0.06]} />
              <meshStandardMaterial color={metalColor} metalness={0.8} />
            </mesh>
            {/* 下部スラスターノズル */}
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[0.07, 0.03, 0.07]} />
              <meshStandardMaterial
                color="#f97316"
                emissive="#f97316"
                emissiveIntensity={isSpeaking ? 2.0 : 0.8}
              />
            </mesh>
          </group>
        </group>

        {/* 頭部: 宇宙服ヘルメット (Cosmo Helmet) */}
        <group position={[0, 0.74, 0]}>
          {/* ヘルメット外殻 */}
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.32, 0.34]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>

          {/* 丸窓風ガラスバイザー (Glass Visor Frame) */}
          <group position={[0, 0, 0.155]}>
            {/* バイザー外枠 (ダークスレート) */}
            <mesh castShadow>
              <boxGeometry args={[0.30, 0.22, 0.04]} />
              <meshStandardMaterial color={skinColor} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* ガラス面 (シアンミラー) */}
            <mesh position={[0, 0, 0.021]}>
              <boxGeometry args={[0.26, 0.18, 0.01]} />
              <meshStandardMaterial
                color={visorColor}
                emissive={visorColor}
                emissiveIntensity={0.6}
                roughness={0.1}
                metalness={0.8}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* バイザー内のドット絵風ロボアイ */}
            <mesh position={[-0.06, 0.01, 0.025]}>
              <boxGeometry args={[0.04, 0.04, 0.01]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#22c55e"
                emissiveIntensity={1.8}
              />
            </mesh>
            <mesh position={[0.06, 0.01, 0.025]}>
              <boxGeometry args={[0.04, 0.04, 0.01]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#22c55e"
                emissiveIntensity={1.8}
              />
            </mesh>
          </group>

          {/* 左右イヤーレシーバー (Side Comms Pods) */}
          <mesh castShadow position={[0.20, 0, 0]}>
            <boxGeometry args={[0.04, 0.12, 0.12]} />
            <meshStandardMaterial color={metalColor} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.20, 0, 0]}>
            <boxGeometry args={[0.04, 0.12, 0.12]} />
            <meshStandardMaterial color={metalColor} metalness={0.8} />
          </mesh>

          {/* 頭頂部アンテナ (Top Antenna) */}
          <group position={[0, 0.16, 0]}>
            {/* アンテナ台座 */}
            <mesh castShadow position={[0, 0.02, 0]}>
              <boxGeometry args={[0.08, 0.04, 0.08]} />
              <meshStandardMaterial color={metalColor} metalness={0.8} />
            </mesh>
            {/* 支柱 */}
            <mesh castShadow position={[0, 0.08, 0]}>
              <boxGeometry args={[0.02, 0.10, 0.02]} />
              <meshStandardMaterial color={metalColor} metalness={0.9} />
            </mesh>
            {/* 先端の赤いランプ (点滅) */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshStandardMaterial
                ref={antennaMatRef}
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        </group>

        {/* 腕 (Arms) */}
        {/* 左腕 */}
        <group ref={leftArmRef} position={[-0.23, 0.44, 0]}>
          <mesh castShadow position={[0, -0.12, 0]}>
            <boxGeometry args={[0.08, 0.24, 0.10]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* マニピュレーター爪ハンド */}
          <mesh castShadow position={[0, -0.26, 0]}>
            <boxGeometry args={[0.07, 0.06, 0.08]} />
            <meshStandardMaterial color={skinColor} metalness={0.7} />
          </mesh>
        </group>

        {/* 右腕 */}
        <group ref={rightArmRef} position={[0.23, 0.44, 0]}>
          <mesh castShadow position={[0, -0.12, 0]}>
            <boxGeometry args={[0.08, 0.24, 0.10]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* マニピュレーター爪ハンド */}
          <mesh castShadow position={[0, -0.26, 0]}>
            <boxGeometry args={[0.07, 0.06, 0.08]} />
            <meshStandardMaterial color={skinColor} metalness={0.7} />
          </mesh>
        </group>
      </group>

      {/* 脚 (Legs: isSitting で切り替え) */}
      {isSitting ? (
        <group name="Legs_Sitting" position={[0, 0.14, 0.12]}>
          {/* 座りポーズ: 前に突き出たロボ脚 */}
          <mesh castShadow position={[-0.10, 0, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.11, 0.22, 0.12]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0.10, 0, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.11, 0.22, 0.12]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
          {/* ブーツ先端 */}
          <mesh castShadow position={[-0.10, 0.04, 0.18]}>
            <boxGeometry args={[0.11, 0.08, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0.10, 0.04, 0.18]}>
            <boxGeometry args={[0.11, 0.08, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        </group>
      ) : (
        <group name="Legs_Standing" position={[0, 0.10, 0]}>
          {/* 直立レッグ */}
          <mesh castShadow position={[-0.10, 0, 0]}>
            <boxGeometry args={[0.11, 0.20, 0.12]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0.10, 0, 0]}>
            <boxGeometry args={[0.11, 0.20, 0.12]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
          {/* ブーツ (マグネットシューズ) */}
          <mesh castShadow position={[-0.10, -0.07, 0.02]}>
            <boxGeometry args={[0.12, 0.06, 0.16]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0.10, -0.07, 0.02]}>
            <boxGeometry args={[0.12, 0.06, 0.16]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* レアリティ共通エフェクト */}
      <AvatarRarityEffects
        rarity="rare"
        isSpeaking={isSpeaking}
        isSitting={isSitting}
        accentColor={accentColor}
      />
    </group>
  );
}
