import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';
import { AvatarRarityEffects } from '@/components/models/avatars/common/AvatarRarityEffects';

/**
 * CyberBunnyModel (Epic)
 * サイバーゴーグルとネオンイヤーを装備した近未来のウサギアバター
 * - 喋っている間 (isSpeaking): ゴーグルとネオンが高速明滅し、耳がピコピコ動く ＆ 浮遊ネオン光粒子が旋回
 * - 大声時 (isShouting): 【バイザーから前方に極太シアンレーザービーム大放射！】
 */
export function CyberBunnyModel({
  color = '#1e1b4b',          // ダークインディゴのサイバージャケット
  skinColor = '#f8fafc',      // 毛並み（ライトホワイト/シルバー）
  accentColor = '#00f0ff',    // ネオンシアンのバイザー・ライン
  isSitting = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: AvatarModelProps) {
  const rightEarRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const visorMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const visorBeamRef = useRef<THREE.Mesh>(null);

  const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.5);

  const earNeon = '#f43f5e'; // ネオンピンク

  // 毎フレームのアニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (isSpeaking) {
      // 耳のピコピコ動くアニメーション
      const earWiggle = Math.sin(t * (isOverdrive ? 24 : 16)) * (isOverdrive ? 0.35 : 0.2);
      if (rightEarRef.current) rightEarRef.current.rotation.x = -0.15 + earWiggle;
      if (leftEarRef.current) leftEarRef.current.rotation.x = -0.15 + earWiggle;

      // ゴーグルのサイバーパルス明滅
      const pulse = isOverdrive
        ? 6.0 + Math.sin(t * 30) * 2.5
        : (Math.sin(t * 18) * 0.5 + 0.5) * 2.2 + 1.2;
      if (visorMatRef.current) visorMatRef.current.emissiveIntensity = pulse;

      // ★ 大声時: バイザーから前方に極太シアンレーザービーム大照射！
      if (visorBeamRef.current) {
        if (isOverdrive) {
          const beamLen = 2.5 + Math.sin(t * 30) * 0.4;
          visorBeamRef.current.scale.set(1.4, 1.4, beamLen);
          (visorBeamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.9;
        } else {
          visorBeamRef.current.scale.set(0, 0, 0);
        }
      }
    } else {
      if (rightEarRef.current) rightEarRef.current.rotation.x = -0.15;
      if (leftEarRef.current) leftEarRef.current.rotation.x = -0.15;
      if (visorMatRef.current) visorMatRef.current.emissiveIntensity = 1.2;
      if (visorBeamRef.current) visorBeamRef.current.scale.set(0, 0, 0);
    }
  });

  return (
    <group>
      {/* 胴体 (Cyber Jacket) */}
      <mesh name="Body" castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.38, 0.46, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* ジャケットのネオンストライプ (胸元ライン) */}
      <mesh position={[0, 0.25, 0.145]}>
        <boxGeometry args={[0.06, 0.38, 0.01]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={isSpeaking ? 2.5 : 1.2}
        />
      </mesh>

      {/* 頭部 (Head) */}
      <mesh name="Head" castShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[0.32, 0.3, 0.28]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* サイバーゴーグル (Cyber Visor) */}
      <group position={[0, 0.64, 0.14]}>
        {/* ゴーグル本体 (ネオンシアン) */}
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.12, 0.04]} />
          <meshStandardMaterial
            ref={visorMatRef}
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        {/* ゴーグル上部のスキャンライン (ピンク) */}
        <mesh position={[0, 0.04, 0.021]}>
          <boxGeometry args={[0.26, 0.02, 0.005]} />
          <meshStandardMaterial
            color={earNeon}
            emissive={earNeon}
            emissiveIntensity={isSpeaking ? 2.8 : 1.4}
          />
        </mesh>
        {/* ★ 大声時: バイザーブラスターレーザービーム！ */}
        <mesh ref={visorBeamRef} position={[0, 0, 0.8]} scale={[0, 0, 0]}>
          <boxGeometry args={[0.28, 0.08, 1.6]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.9} />
        </mesh>
      </group>

      {/* ヘッドセット (Headset & Ear Cups) */}
      <group position={[0, 0.62, 0]}>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.36, 0.04, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0.18, 0.02, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-0.18, 0.02, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* ウサギの長い耳 (Bunny Ears - useFrameでピコピコ動く) */}
      {/* 右耳 */}
      <group ref={rightEarRef} position={[0.1, 0.88, -0.02]} rotation={[-0.15, 0, 0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.32, 0.08]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, 0, 0.041]}>
          <boxGeometry args={[0.05, 0.24, 0.01]} />
          <meshStandardMaterial
            color={earNeon}
            emissive={earNeon}
            emissiveIntensity={isSpeaking ? 2.5 : 1.2}
          />
        </mesh>
      </group>

      {/* 左耳 */}
      <group ref={leftEarRef} position={[-0.1, 0.88, -0.02]} rotation={[-0.15, 0, -0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.32, 0.08]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, 0, 0.041]}>
          <boxGeometry args={[0.05, 0.24, 0.01]} />
          <meshStandardMaterial
            color={earNeon}
            emissive={earNeon}
            emissiveIntensity={isSpeaking ? 2.5 : 1.2}
          />
        </mesh>
      </group>

      {/* 丸いウサギのしっぽ */}
      <mesh castShadow position={[0, 0.1, -0.16]}>
        <boxGeometry args={[0.1, 0.1, 0.08]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* 腕 (Arms) */}
      <mesh name="Arm_R" castShadow position={[0.24, 0.32, 0.06]} rotation={[-1.2, 0, 0]}>
        <boxGeometry args={[0.09, 0.34, 0.09]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh name="Arm_L" castShadow position={[-0.24, 0.32, 0.06]} rotation={[-1.2, 0, 0]}>
        <boxGeometry args={[0.09, 0.34, 0.09]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 脚 (Legs) - 着席・直立ポーズ切り替え */}
      {isSitting ? (
        <group name="Legs_Sitting" position={[0, 0.05, 0.12]}>
          <mesh name="Leg_R" castShadow position={[0.09, 0, 0.12]}>
            <boxGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh name="Leg_L" castShadow position={[-0.09, 0, 0.12]}>
            <boxGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.09, -0.04, 0.16]}>
            <boxGeometry args={[0.1, 0.02, 0.2]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.5}
            />
          </mesh>
          <mesh position={[-0.09, -0.04, 0.16]}>
            <boxGeometry args={[0.1, 0.02, 0.2]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      ) : (
        <group name="Legs_Standing" position={[0, 0.02, 0]}>
          <mesh name="Leg_R" castShadow position={[0.1, -0.12, 0]}>
            <boxGeometry args={[0.1, 0.28, 0.12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh name="Leg_L" castShadow position={[-0.1, -0.12, 0]}>
            <boxGeometry args={[0.1, 0.28, 0.12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.1, -0.24, 0.02]}>
            <boxGeometry args={[0.1, 0.04, 0.16]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.5}
            />
          </mesh>
          <mesh position={[-0.1, -0.24, 0.02]}>
            <boxGeometry args={[0.1, 0.04, 0.16]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      )}

      {/* レアリティ共通エフェクト (Epic: 浮遊ネオン光粒子キューブ ＆ ダイナミックライト) */}
      <AvatarRarityEffects
        rarity="epic"
        isSpeaking={isSpeaking}
        isSitting={isSitting}
        voiceVolume={voiceVolume}
        isShouting={isShouting}
        accentColor={accentColor}
      />
    </group>
  );
}
