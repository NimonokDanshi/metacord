import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';
import { AvatarRarityEffects } from './common/AvatarRarityEffects';
import { useAvatarGimmick } from './common/useAvatarGimmick';

/**
 * MechaDragonModel (Legendary)
 * 重厚なメタリック装甲とエナジーホーンを備えたメカニカルなボクセルドランゴン
 * - 通常発言時: メカ翼の羽ばたき、エナジーホーンとコアの明滅
 * - 大声シャウト時 (isShouting / OVERDRIVE):
 *   - 頭部を大きく仰ぎ、口元からプラズマ咆哮ビームを前方へ大放射！
 *   - 巨大メカ翼がフル展開し、激しく羽ばたく！
 *   - 全身が振動し、足元の二重反転メガ魔法陣が部屋全体に拡大！
 */
export function MechaDragonModel({
  color = '#1e293b',          // ダークスレート/ガンメタルの装甲
  skinColor = '#0f172a',      // インナーフレーム
  accentColor = '#f59e0b',    // レジェンダリーゴールドのエナジーライン
  isSitting = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: AvatarModelProps) {
  const headGroupRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const hornMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const roarBeamRef = useRef<THREE.Mesh>(null);

  const { groupRef, valuesRef } = useAvatarGimmick({
    rarity: 'legendary',
    isSitting,
    isSpeaking,
    voiceVolume,
    isShouting,
  });

  const cyanEnergy = '#06b6d4';

  // 毎フレームのアニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const isOverdrive = valuesRef.current.isOverdrive;

    if (isOverdrive) {
      // 大声咆哮時: 頭を斜め上に仰ぎ、全身が激しく振動
      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = -0.35 + Math.sin(t * 30) * 0.05;
      }
      // 翼の最大展開＆高速羽ばたき
      const flap = Math.sin(t * 18) * 0.55 + 0.6;
      if (rightWingRef.current) rightWingRef.current.rotation.y = flap;
      if (leftWingRef.current) leftWingRef.current.rotation.y = -flap;

      // 限界突破エナジー発光
      if (coreMatRef.current) coreMatRef.current.emissiveIntensity = 5.0 + Math.sin(t * 25) * 2.0;
      if (hornMatRef.current) hornMatRef.current.emissiveIntensity = 4.5 + Math.sin(t * 25) * 1.5;

      // 口元からの咆哮プラズマビーム
      if (roarBeamRef.current) {
        roarBeamRef.current.scale.set(1.0 + Math.sin(t * 35) * 0.2, 1.0 + Math.sin(t * 30) * 0.15, 1.0);
      }
    } else if (isSpeaking) {
      if (headGroupRef.current) headGroupRef.current.rotation.x = Math.sin(t * 10) * 0.08;
      // 通常発言: 翼のダイナミックな羽ばたき
      const flap = Math.sin(t * 8) * 0.35 + 0.2;
      if (rightWingRef.current) rightWingRef.current.rotation.y = flap;
      if (leftWingRef.current) leftWingRef.current.rotation.y = -flap;

      const pulse = valuesRef.current.glowIntensity;
      if (coreMatRef.current) coreMatRef.current.emissiveIntensity = pulse;
      if (hornMatRef.current) hornMatRef.current.emissiveIntensity = pulse * 0.9;
    } else {
      if (headGroupRef.current) headGroupRef.current.rotation.x = 0;
      if (rightWingRef.current) rightWingRef.current.rotation.y = 0.15;
      if (leftWingRef.current) leftWingRef.current.rotation.y = -0.15;
      if (coreMatRef.current) coreMatRef.current.emissiveIntensity = 1.2;
      if (hornMatRef.current) hornMatRef.current.emissiveIntensity = 1.0;
    }
  });

  const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.6);

  return (
    <group ref={groupRef}>
      {/* 胴体装甲 (Mecha Torso) */}
      <mesh name="Torso" castShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[0.38, 0.44, 0.32]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 胸部エナジーコア (Reactor Core) */}
      <mesh position={[0, 0.32, 0.165]}>
        <boxGeometry args={[0.12, 0.14, 0.02]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color={cyanEnergy}
          emissive={cyanEnergy}
          emissiveIntensity={1.4}
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
      <group ref={headGroupRef} position={[0, 0.65, 0.05]}>
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

        {/* 大声シャウト時の口元プラズマ咆哮ビーム (Roar Plasma Beam) */}
        {isOverdrive && (
          <group position={[0, -0.06, 0.32]} rotation={[0.08, 0, 0]}>
            {/* メインビームコア */}
            <mesh ref={roarBeamRef} position={[0, 0, 0.55]}>
              <boxGeometry args={[0.16, 0.16, 1.1]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
            </mesh>
            {/* 外周プラズマフレア */}
            <mesh position={[0, 0, 0.5]}>
              <boxGeometry args={[0.28, 0.28, 1.0]} />
              <meshBasicMaterial color={cyanEnergy} transparent opacity={0.65} />
            </mesh>
            {/* 拡散ショックリング */}
            <mesh position={[0, 0, 0.2]}>
              <ringGeometry args={[0.12, 0.32, 16]} />
              <meshBasicMaterial color={accentColor} transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* エナジーアイ (Glowing Visor Eyes) */}
        <mesh position={[0.09, 0.02, 0.18]}>
          <boxGeometry args={[0.07, 0.04, 0.02]} />
          <meshStandardMaterial
            color={cyanEnergy}
            emissive={cyanEnergy}
            emissiveIntensity={1.5}
          />
        </mesh>
        <mesh position={[-0.09, 0.02, 0.18]}>
          <boxGeometry args={[0.07, 0.04, 0.02]} />
          <meshStandardMaterial
            color={cyanEnergy}
            emissive={cyanEnergy}
            emissiveIntensity={1.5}
          />
        </mesh>

        {/* エナジーホーン (Dragon Horns - ゴールド発光) */}
        {/* 右角 */}
        <group position={[0.12, 0.18, -0.06]} rotation={[-0.3, 0.15, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.24, 0.08]} />
            <meshStandardMaterial
              ref={hornMatRef}
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.2}
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
              emissiveIntensity={1.2}
              metalness={0.9}
            />
          </mesh>
        </group>
      </group>

      {/* メカニカルウィング (Mecha Wings - useFrameで羽ばたく) */}
      {/* 右翼 */}
      <group ref={rightWingRef} position={[0.16, 0.38, -0.16]} rotation={[0, 0.15, -0.2]}>
        <mesh castShadow position={[0.2, 0.12, 0]}>
          <boxGeometry args={[0.38, 0.06, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.8} />
        </mesh>
        <mesh position={[0.24, 0.04, 0]}>
          <boxGeometry args={[0.34, 0.18, 0.02]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.5}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0.42, 0.16, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.03]} />
          <meshStandardMaterial color={cyanEnergy} emissive={cyanEnergy} emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* 左翼 */}
      <group ref={leftWingRef} position={[-0.16, 0.38, -0.16]} rotation={[0, -0.15, 0.2]}>
        <mesh castShadow position={[-0.2, 0.12, 0]}>
          <boxGeometry args={[0.38, 0.06, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.8} />
        </mesh>
        <mesh position={[-0.24, 0.04, 0]}>
          <boxGeometry args={[0.34, 0.18, 0.02]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.5}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[-0.42, 0.16, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.03]} />
          <meshStandardMaterial color={cyanEnergy} emissive={cyanEnergy} emissiveIntensity={1.5} />
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
        <mesh position={[0, 0.12, -0.34]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.04, 0.18, 0.14]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.5}
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
          <mesh castShadow position={[0.11, 0, 0.12]}>
            <boxGeometry args={[0.12, 0.12, 0.3]} />
            <meshStandardMaterial color={skinColor} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.11, 0, 0.12]}>
            <boxGeometry args={[0.12, 0.12, 0.3]} />
            <meshStandardMaterial color={skinColor} metalness={0.8} />
          </mesh>
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
          <mesh castShadow position={[0.11, -0.1, 0]}>
            <boxGeometry args={[0.12, 0.28, 0.14]} />
            <meshStandardMaterial color={skinColor} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.11, -0.1, 0]}>
            <boxGeometry args={[0.12, 0.28, 0.14]} />
            <meshStandardMaterial color={skinColor} metalness={0.8} />
          </mesh>
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

      {/* レジェンダリー共通エフェクト (二重反転魔法陣・領域展開・エナジー光柱・ショックウェーブ) */}
      <AvatarRarityEffects
        rarity="legendary"
        isSpeaking={isSpeaking}
        isSitting={isSitting}
        voiceVolume={voiceVolume}
        isShouting={isShouting}
        accentColor={cyanEnergy}
      />
    </group>
  );
}
