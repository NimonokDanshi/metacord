import React from 'react';
import { AvatarModelProps } from '@/types/avatar';

/**
 * CyberBunnyModel (Epic)
 * サイバーゴーグルとネオンイヤーを装備した近未来のウサギアバター
 * 喋っている間 (isSpeaking = true)、ゴーグルとネオンイヤーの発光強度が増加します。
 */
export function CyberBunnyModel({
  color = '#1e1b4b',          // ダークインディゴのサイバージャケット
  skinColor = '#f8fafc',      // 毛並み（ライトホワイト/シルバー）
  accentColor = '#00f0ff',    // ネオンシアンのバイザー・ライン
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  // 発光設定: 喋っている時は光を強調
  const neonIntensity = isSpeaking ? 2.5 : 1.2;
  const earNeon = '#f43f5e'; // ネオンピンク

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
          emissiveIntensity={neonIntensity}
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
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={neonIntensity}
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
            emissiveIntensity={neonIntensity * 1.5}
          />
        </mesh>
      </group>

      {/* ヘッドセット (Headset & Ear Cups) */}
      <group position={[0, 0.62, 0]}>
        {/* ヘッドバンド */}
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.36, 0.04, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        {/* 右イヤーカップ */}
        <mesh position={[0.18, 0.02, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* 左イヤーカップ */}
        <mesh position={[-0.18, 0.02, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* ウサギの長い耳 (Bunny Ears with Neon Core) */}
      {/* 右耳 */}
      <group position={[0.1, 0.88, -0.02]} rotation={[-0.15, 0, 0.08]}>
        {/* 耳の外枠 */}
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.32, 0.08]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* 耳の内側ネオン (ピンク) */}
        <mesh position={[0, 0, 0.041]}>
          <boxGeometry args={[0.05, 0.24, 0.01]} />
          <meshStandardMaterial
            color={earNeon}
            emissive={earNeon}
            emissiveIntensity={neonIntensity}
          />
        </mesh>
      </group>

      {/* 左耳 */}
      <group position={[-0.1, 0.88, -0.02]} rotation={[-0.15, 0, -0.08]}>
        {/* 耳の外枠 */}
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.32, 0.08]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* 耳の内側ネオン (ピンク) */}
        <mesh position={[0, 0, 0.041]}>
          <boxGeometry args={[0.05, 0.24, 0.01]} />
          <meshStandardMaterial
            color={earNeon}
            emissive={earNeon}
            emissiveIntensity={neonIntensity}
          />
        </mesh>
      </group>

      {/* 丸いウサギのしっぽ (Fluffy Tail) */}
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
          {/* 着席時: 脚を前方に伸ばす */}
          <mesh name="Leg_R" castShadow position={[0.09, 0, 0.12]}>
            <boxGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh name="Leg_L" castShadow position={[-0.09, 0, 0.12]}>
            <boxGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* スニーカーのネオンソール */}
          <mesh position={[0.09, -0.04, 0.16]}>
            <boxGeometry args={[0.1, 0.02, 0.2]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={neonIntensity}
            />
          </mesh>
          <mesh position={[-0.09, -0.04, 0.16]}>
            <boxGeometry args={[0.1, 0.02, 0.2]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={neonIntensity}
            />
          </mesh>
        </group>
      ) : (
        <group name="Legs_Standing" position={[0, 0.02, 0]}>
          {/* 直立時 */}
          <mesh name="Leg_R" castShadow position={[0.1, -0.12, 0]}>
            <boxGeometry args={[0.1, 0.28, 0.12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh name="Leg_L" castShadow position={[-0.1, -0.12, 0]}>
            <boxGeometry args={[0.1, 0.28, 0.12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* スニーカーのネオンソール */}
          <mesh position={[0.1, -0.24, 0.02]}>
            <boxGeometry args={[0.1, 0.04, 0.16]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={neonIntensity}
            />
          </mesh>
          <mesh position={[-0.1, -0.24, 0.02]}>
            <boxGeometry args={[0.1, 0.04, 0.16]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={neonIntensity}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
