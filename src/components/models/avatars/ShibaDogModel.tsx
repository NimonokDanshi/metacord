import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';

/**
 * ShibaDogModel (Rare)
 * 愛らしいボクセル柴犬のアバター
 * - 喋っている間 (isSpeaking = true) は耳がリアルタイムにパタパタ動きます
 * - 着席時 (isSitting = true) はお行儀よく「おすわり」ポーズに変化
 */
export function ShibaDogModel({
  color = '#c27838',          // 柴犬の赤茶（フォーン）
  skinColor = '#fdfbf7',      // お腹・頬・足先の白毛 (ウラジロ)
  isSitting = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: AvatarModelProps) {
  const rightEarRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.5);

  // 毎フレームのアニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (isSpeaking) {
      // 喋っている時は耳が素早くパタパタ動く (通常15Hz / 大声24Hz)
      const earAngle = Math.sin(t * (isOverdrive ? 24 : 15)) * (isOverdrive ? 0.4 : 0.25);
      if (rightEarRef.current) rightEarRef.current.rotation.x = -earAngle;
      if (leftEarRef.current) leftEarRef.current.rotation.x = -earAngle;

      // ★ 尻尾: 通常は嬉しそうに左右フリフリ、大声時は【360度ドリルテール超高速スピン！】
      if (tailRef.current) {
        if (isOverdrive) {
          tailRef.current.rotation.z = (t * 32) % (Math.PI * 2);
          tailRef.current.rotation.y = 0;
        } else {
          tailRef.current.rotation.z = 0;
          tailRef.current.rotation.y = Math.sin(t * 14) * 0.28;
        }
      }
    } else {
      // 待機時は定位置に戻す
      if (rightEarRef.current) rightEarRef.current.rotation.x = 0;
      if (leftEarRef.current) leftEarRef.current.rotation.x = 0;
      if (tailRef.current) {
        tailRef.current.rotation.x = 0;
        tailRef.current.rotation.y = 0;
        tailRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group>
      {/* 胴体 (Body) */}
      <mesh name="Body" castShadow position={[0, 0.24, -0.06]}>
        <boxGeometry args={[0.34, 0.3, 0.44]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* お腹の白毛 (Belly) */}
      <mesh position={[0, 0.21, -0.06]}>
        <boxGeometry args={[0.22, 0.22, 0.442]} />
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </mesh>

      {/* 首輪 (Red Collar with Gold Bell) */}
      <group position={[0, 0.35, 0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.05, 0.1]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>
        {/* ゴールドの鈴/チャーム */}
        <mesh castShadow position={[0, -0.04, 0.05]}>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 頭部 (Head) */}
      <group position={[0, 0.42, 0.22]}>
        {/* 頭本体 */}
        <mesh name="Head" castShadow>
          <boxGeometry args={[0.34, 0.3, 0.28]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>

        {/* 頬の白毛 (左右) */}
        <mesh position={[0.13, -0.04, 0.04]}>
          <boxGeometry args={[0.1, 0.18, 0.22]} />
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </mesh>
        <mesh position={[-0.13, -0.04, 0.04]}>
          <boxGeometry args={[0.1, 0.18, 0.22]} />
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </mesh>

        {/* マズル・鼻口 (Muzzle) */}
        <group position={[0, -0.06, 0.18]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.12, 0.12]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0.04, 0.062]}>
            <boxGeometry args={[0.06, 0.04, 0.02]} />
            <meshStandardMaterial color="#1c1917" roughness={0.4} />
          </mesh>
        </group>

        {/* 目 (Eyes) */}
        <mesh name="Eye_R" castShadow position={[0.09, 0.04, 0.142]}>
          <boxGeometry args={[0.04, 0.05, 0.01]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>
        <mesh name="Eye_L" castShadow position={[-0.09, 0.04, 0.142]}>
          <boxGeometry args={[0.04, 0.05, 0.01]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>

        {/* 麻呂眉 */}
        <mesh position={[0.08, 0.12, 0.142]}>
          <boxGeometry args={[0.04, 0.03, 0.01]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[-0.08, 0.12, 0.142]}>
          <boxGeometry args={[0.04, 0.03, 0.01]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* 三角耳 (Ears) - useFrameでパタパタ動く */}
        <group ref={rightEarRef} position={[0.12, 0.18, -0.02]} rotation={[0, 0, 0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.12, 0.06]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, -0.01, 0.031]}>
            <boxGeometry args={[0.05, 0.08, 0.01]} />
            <meshStandardMaterial color="#fda4af" />
          </mesh>
        </group>

        <group ref={leftEarRef} position={[-0.12, 0.18, -0.02]} rotation={[0, 0, -0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.12, 0.06]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, -0.01, 0.031]}>
            <boxGeometry args={[0.05, 0.08, 0.01]} />
            <meshStandardMaterial color="#fda4af" />
          </mesh>
        </group>
      </group>

      {/* 巻き尾 (Curled Tail) */}
      <group ref={tailRef} position={[0, 0.36, -0.26]} rotation={[0.4, 0, 0]}>
        <mesh castShadow position={[0, 0.06, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.08]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh castShadow position={[0, 0.12, 0.06]} rotation={[-0.6, 0, 0]}>
          <boxGeometry args={[0.07, 0.1, 0.07]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* 脚 (Legs) - おすわり(着席) と 立ちポーズの切り替え */}
      {isSitting ? (
        <group name="Legs_Sitting">
          {/* 前足 */}
          <mesh castShadow position={[0.1, 0.09, 0.08]}>
            <boxGeometry args={[0.09, 0.18, 0.09]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <mesh castShadow position={[-0.1, 0.09, 0.08]}>
            <boxGeometry args={[0.09, 0.18, 0.09]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* 後ろ足 (おすわりポーズ) */}
          <mesh castShadow position={[0.14, 0.06, -0.16]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[-0.14, 0.06, -0.16]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.14, 0.02, -0.06]}>
            <boxGeometry args={[0.08, 0.06, 0.08]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <mesh position={[-0.14, 0.02, -0.06]}>
            <boxGeometry args={[0.08, 0.06, 0.08]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
      ) : (
        <group name="Legs_Standing">
          {/* 前足 */}
          <mesh castShadow position={[0.11, 0.08, 0.1]}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <mesh castShadow position={[-0.11, 0.08, 0.1]}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* 後ろ足 */}
          <mesh castShadow position={[0.11, 0.08, -0.2]}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[-0.11, 0.08, -0.2]}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.11, 0.02, -0.2]}>
            <boxGeometry args={[0.092, 0.04, 0.092]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <mesh position={[-0.11, 0.02, -0.2]}>
            <boxGeometry args={[0.092, 0.04, 0.092]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
      )}
    </group>
  );
}
