import React from 'react';
import { AvatarModelProps } from '@/types/avatar';

/**
 * MechaDragonModel (Legendary)
 * 重厚なメタリック装甲とエナジーホーンを備えたメカニカルなボクセルドランゴン
 * - 胸部にエナジーコア（リアクター）、背中にメカウィング、先端ブレード付きのメカテイル
 * - 着席時 (isSitting = true) は脚を折り曲げて着席
 * - 喋っている間 (isSpeaking = true) はエナジーホーンとコアが強く発光し、翼が羽ばたきます
 */
export function MechaDragonModel({
  color = '#1e293b',          // ダークスレート/ガンメタルの装甲
  skinColor = '#0f172a',      // インナーフレーム
  accentColor = '#f59e0b',    // レジェンダリーゴールドのエナジーライン
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  // 発言時のエナジーブースト
  const neonIntensity = isSpeaking ? 3.0 : 1.4;
  const cyanEnergy = '#06b6d4'; // コア・アイ用ネオンシアン
  const wingAngle = isSpeaking ? 0.35 : 0.15; // 喋ると翼が大きく展開

  return (
    <group>
      {/* 胴体装甲 (Mecha Torso) */}
      <mesh name="Torso" castShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[0.38, 0.44, 0.32]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 胸部エナジーコア (Reactor Core) */}
      <mesh position={[0, 0.32, 0.165]}>
        <boxGeometry args={[0.12, 0.14, 0.02]} />
        <meshStandardMaterial
          color={cyanEnergy}
          emissive={cyanEnergy}
          emissiveIntensity={neonIntensity}
        />
      </mesh>
      {/* コアフレーム (Gold Border) */}
      <mesh position={[0, 0.32, 0.162]}>
        <boxGeometry args={[0.16, 0.18, 0.01]} />
        <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 肩アーマー (Shoulder Armor - 左右) */}
      <mesh castShadow position={[0.24, 0.46, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.2]} />
        <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[-0.24, 0.46, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.2]} />
        <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ドラゴン頭部 (Dragon Head) */}
      <group position={[0, 0.65, 0.05]}>
        {/* 頭部メイン装甲 */}
        <mesh name="Head" castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.34, 0.26, 0.32]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
        </mesh>

        {/* シャープなドラゴンの鼻先・顎 (Snout / Jaw) */}
        <mesh castShadow position={[0, -0.05, 0.2]}>
          <boxGeometry args={[0.22, 0.14, 0.16]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
        </mesh>
        {/* 口元のゴールド牙/ブレード */}
        <mesh position={[0.1, -0.1, 0.22]}>
          <boxGeometry args={[0.03, 0.06, 0.04]} />
          <meshStandardMaterial color={accentColor} metalness={0.9} />
        </mesh>
        <mesh position={[-0.1, -0.1, 0.22]}>
          <boxGeometry args={[0.03, 0.06, 0.04]} />
          <meshStandardMaterial color={accentColor} metalness={0.9} />
        </mesh>

        {/* エナジーアイ (Glowing Visor Eyes) */}
        <mesh position={[0.09, 0.02, 0.18]}>
          <boxGeometry args={[0.07, 0.04, 0.02]} />
          <meshStandardMaterial
            color={cyanEnergy}
            emissive={cyanEnergy}
            emissiveIntensity={neonIntensity}
          />
        </mesh>
        <mesh position={[-0.09, 0.02, 0.18]}>
          <boxGeometry args={[0.07, 0.04, 0.02]} />
          <meshStandardMaterial
            color={cyanEnergy}
            emissive={cyanEnergy}
            emissiveIntensity={neonIntensity}
          />
        </mesh>

        {/* エナジーホーン (Dragon Horns - ゴールド発光) */}
        {/* 右角 */}
        <group position={[0.12, 0.18, -0.06]} rotation={[-0.3, 0.15, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.24, 0.08]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={neonIntensity * 0.8}
              metalness={0.9}
            />
          </mesh>
        </group>
        {/* 左角 */}
        <group position={[-0.12, 0.18, -0.06]} rotation={[-0.3, -0.15, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.24, 0.08]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={neonIntensity * 0.8}
              metalness={0.9}
            />
          </mesh>
        </group>
      </group>

      {/* メカニカルウィング (Mecha Wings - 喋ると羽ばたく) */}
      {/* 右翼 */}
      <group position={[0.16, 0.38, -0.16]} rotation={[0, wingAngle, -0.2]}>
        {/* 翼の主骨格 */}
        <mesh castShadow position={[0.2, 0.12, 0]}>
          <boxGeometry args={[0.38, 0.06, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.8} />
        </mesh>
        {/* 翼のエナジーブレード (ゴールド発光) */}
        <mesh position={[0.24, 0.04, 0]}>
          <boxGeometry args={[0.34, 0.18, 0.02]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={neonIntensity}
            metalness={0.8}
          />
        </mesh>
        {/* 翼端の鋭角スパイク */}
        <mesh position={[0.42, 0.16, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.03]} />
          <meshStandardMaterial color={cyanEnergy} emissive={cyanEnergy} emissiveIntensity={neonIntensity} />
        </mesh>
      </group>

      {/* 左翼 */}
      <group position={[-0.16, 0.38, -0.16]} rotation={[0, -wingAngle, 0.2]}>
        {/* 翼の主骨格 */}
        <mesh castShadow position={[-0.2, 0.12, 0]}>
          <boxGeometry args={[0.38, 0.06, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.8} />
        </mesh>
        {/* 翼のエナジーブレード (ゴールド発光) */}
        <mesh position={[-0.24, 0.04, 0]}>
          <boxGeometry args={[0.34, 0.18, 0.02]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={neonIntensity}
            metalness={0.8}
          />
        </mesh>
        {/* 翼端の鋭角スパイク */}
        <mesh position={[-0.42, 0.16, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.03]} />
          <meshStandardMaterial color={cyanEnergy} emissive={cyanEnergy} emissiveIntensity={neonIntensity} />
        </mesh>
      </group>

      {/* メカニカルテイル (Segmented Tail with Blade) */}
      <group position={[0, 0.16, -0.16]} rotation={[-0.3, 0, 0]}>
        <mesh castShadow position={[0, 0, -0.1]}>
          <boxGeometry args={[0.1, 0.1, 0.2]} />
          <meshStandardMaterial color={color} metalness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 0.04, -0.25]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.18]} />
          <meshStandardMaterial color={color} metalness={0.8} />
        </mesh>
        {/* 尾端のゴールドブレード */}
        <mesh position={[0, 0.12, -0.34]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.04, 0.18, 0.14]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={neonIntensity}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* 腕部 (Arms with Cyber Claws) */}
      <mesh name="Arm_R" castShadow position={[0.26, 0.32, 0.06]} rotation={[-1.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.32, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.8} />
      </mesh>
      <mesh name="Arm_L" castShadow position={[-0.26, 0.32, 0.06]} rotation={[-1.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.32, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.8} />
      </mesh>

      {/* 脚部 (Legs - 着席・直立ポーズ) */}
      {isSitting ? (
        <group name="Legs_Sitting" position={[0, 0.05, 0.12]}>
          {/* 着席時: 太ももと爪先 */}
          <mesh castShadow position={[0.11, 0, 0.12]}>
            <boxGeometry args={[0.12, 0.12, 0.3]} />
            <meshStandardMaterial color={skinColor} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.11, 0, 0.12]}>
            <boxGeometry args={[0.12, 0.12, 0.3]} />
            <meshStandardMaterial color={skinColor} metalness={0.8} />
          </mesh>
          {/* 足先のゴールド爪 */}
          <mesh position={[0.11, -0.03, 0.26]}>
            <boxGeometry args={[0.1, 0.04, 0.08]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} />
          </mesh>
          <mesh position={[-0.11, -0.03, 0.26]}>
            <boxGeometry args={[0.1, 0.04, 0.08]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} />
          </mesh>
        </group>
      ) : (
        <group name="Legs_Standing" position={[0, 0.02, 0]}>
          {/* 直立時 */}
          <mesh castShadow position={[0.11, -0.1, 0]}>
            <boxGeometry args={[0.12, 0.28, 0.14]} />
            <meshStandardMaterial color={skinColor} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.11, -0.1, 0]}>
            <boxGeometry args={[0.12, 0.28, 0.14]} />
            <meshStandardMaterial color={skinColor} metalness={0.8} />
          </mesh>
          {/* 足先のゴールド爪 */}
          <mesh position={[0.11, -0.22, 0.06]}>
            <boxGeometry args={[0.12, 0.06, 0.12]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} />
          </mesh>
          <mesh position={[-0.11, -0.22, 0.06]}>
            <boxGeometry args={[0.12, 0.06, 0.12]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}
