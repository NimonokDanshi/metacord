import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';

/**
 * ChubbyChickModel (Common)
 * コロンと丸い黄色いヒヨコのアバター
 * - 喋っている間 (isSpeaking = true) は小さな羽をリアルタイムに激しくパタパタ動かします
 * - 着席時 (isSitting = true) は足をちょこんと前方に投げ出して座ります
 */
export function ChubbyChickModel({
  color = '#facc15',          // ヒヨコイエロー
  skinColor = '#fef08a',      // お腹の淡いクリームイエロー
  accentColor = '#f97316',    // くちばし・足先のオレンジ
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  const rightWingRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);

  // 毎フレームのアニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (isSpeaking) {
      // 喋っている時は羽を高速にパタパタ羽ばたかせる (18Hz)
      const flap = Math.sin(t * 18) * 0.45;
      if (rightWingRef.current) rightWingRef.current.rotation.z = flap;
      if (leftWingRef.current) leftWingRef.current.rotation.z = -flap;
    } else {
      if (rightWingRef.current) rightWingRef.current.rotation.z = 0;
      if (leftWingRef.current) leftWingRef.current.rotation.z = 0;
    }
  });

  return (
    <group>
      {/* まんまるな胴体 (Chubby Body) */}
      <mesh name="Body" castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* お腹の淡いパッチ (Belly Patch) */}
      <mesh position={[0, 0.26, 0.192]}>
        <boxGeometry args={[0.26, 0.24, 0.01]} />
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </mesh>

      {/* 頭のぴょこんとした羽 (Head Tuft / Ahoge) */}
      <group position={[0, 0.52, 0.02]} rotation={[0.2, 0, 0]}>
        <mesh castShadow position={[0, 0.04, 0]}>
          <boxGeometry args={[0.06, 0.1, 0.06]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* つぶらな黒目 (Cute Black Eyes) */}
      <mesh name="Eye_R" castShadow position={[0.1, 0.36, 0.192]}>
        <boxGeometry args={[0.04, 0.05, 0.02]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.2} />
      </mesh>
      <mesh name="Eye_L" castShadow position={[-0.1, 0.36, 0.192]}>
        <boxGeometry args={[0.04, 0.05, 0.02]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.2} />
      </mesh>
      {/* 目のハイライト (白) */}
      <mesh position={[0.11, 0.38, 0.203]}>
        <boxGeometry args={[0.015, 0.015, 0.005]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.09, 0.38, 0.203]}>
        <boxGeometry args={[0.015, 0.015, 0.005]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* ほんのりピンクのほっぺ (Blush Cheeks) */}
      <mesh position={[0.14, 0.28, 0.192]}>
        <boxGeometry args={[0.06, 0.04, 0.005]} />
        <meshStandardMaterial color="#fda4af" opacity={0.7} transparent />
      </mesh>
      <mesh position={[-0.14, 0.28, 0.192]}>
        <boxGeometry args={[0.06, 0.04, 0.005]} />
        <meshStandardMaterial color="#fda4af" opacity={0.7} transparent />
      </mesh>

      {/* くちばし (Orange Beak) */}
      <mesh castShadow position={[0, 0.31, 0.23]}>
        <boxGeometry args={[0.09, 0.06, 0.08]} />
        <meshStandardMaterial color={accentColor} roughness={0.6} />
      </mesh>

      {/* 小さな羽 (Tiny Wings - useFrameでパタパタ動く) */}
      {/* 右羽 */}
      <group ref={rightWingRef} position={[0.2, 0.3, 0]}>
        <mesh castShadow position={[0.03, 0, 0]}>
          <boxGeometry args={[0.06, 0.16, 0.18]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* 左羽 */}
      <group ref={leftWingRef} position={[-0.2, 0.3, 0]}>
        <mesh castShadow position={[-0.03, 0, 0]}>
          <boxGeometry args={[0.06, 0.16, 0.18]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* オレンジの足 (Feet) - 着席・直立ポーズ */}
      {isSitting ? (
        <group name="Feet_Sitting" position={[0, 0.06, 0.16]}>
          {/* 足を前方に投げ出して座る */}
          <mesh castShadow position={[0.09, 0, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.16]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
          <mesh castShadow position={[-0.09, 0, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.16]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
        </group>
      ) : (
        <group name="Feet_Standing" position={[0, 0.04, 0.02]}>
          {/* 直立 */}
          <mesh castShadow position={[0.09, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.12]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
          <mesh castShadow position={[-0.09, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.12]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
        </group>
      )}
    </group>
  );
}
