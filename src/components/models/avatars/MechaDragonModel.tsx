import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';

/**
 * MechaDragonModel (Legendary)
 * 重厚なメタリック装甲とエナジーホーンを備えたメカニカルなボクセルドランゴン
 * - 喋っている間 (isSpeaking = true) はメカ翼が大きくダイナミックに羽ばたき、エナジーホーンとコアが激しく明滅します
 * - 着席時 (isSitting = true) は脚を折り曲げて着席
 */
export function MechaDragonModel({
  color = '#1e293b',          // ダークスレート/ガンメタルの装甲
  skinColor = '#0f172a',      // インナーフレーム
  accentColor = '#f59e0b',    // レジェンダリーゴールドのエナジーライン
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  const rightWingRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const hornMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const cyanEnergy = '#06b6d4';

  // 毎フレームのアニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (isSpeaking) {
      // 翼のダイナミックな羽ばたき (8Hz)
      const flap = Math.sin(t * 8) * 0.35 + 0.2;
      if (rightWingRef.current) rightWingRef.current.rotation.y = flap;
      if (leftWingRef.current) leftWingRef.current.rotation.y = -flap;

      // ネオンエナジーのパルス明滅
      const pulse = (Math.sin(t * 12) * 0.5 + 0.5) * 2.0 + 1.5;
      if (coreMatRef.current) coreMatRef.current.emissiveIntensity = pulse;
      if (hornMatRef.current) hornMatRef.current.emissiveIntensity = pulse * 0.9;
    } else {
      if (rightWingRef.current) rightWingRef.current.rotation.y = 0.15;
      if (leftWingRef.current) leftWingRef.current.rotation.y = -0.15;
      if (coreMatRef.current) coreMatRef.current.emissiveIntensity = 1.2;
      if (hornMatRef.current) hornMatRef.current.emissiveIntensity = 1.0;
    }
  });

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
    </group>
  );
}
