import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';

/**
 * BaristaBearModel (Common)
 * カフェエプロンを着けた癒やし系のボクセルクマさんアバター
 * - 通常時: まあるい耳がピコピコ動く
 * - 発言・大声時 (isSpeaking / isShouting):
 *   【激しい台パン（机バンバン！）】
 *   両手を前方に構えて激しく机/前方をドンドン叩きつける！大声時はさらに超猛連打！
 */
export function BaristaBearModel({
  color = '#854d0e',          // 落ち着いたブラウンの毛並み
  skinColor = '#fef3c7',      // マズル・耳の内側のクリーム色
  accentColor = '#15803d',    // 深緑のカフェエプロン
  isSitting = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: AvatarModelProps) {
  const rightEarRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);

  const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.5);

  // 毎フレームのアニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (isSpeaking) {
      // 1. 耳のピコピコ動くアニメーション
      const earWiggle = Math.sin(t * (isOverdrive ? 22 : 14)) * 0.25;
      if (rightEarRef.current) rightEarRef.current.rotation.x = earWiggle;
      if (leftEarRef.current) leftEarRef.current.rotation.x = earWiggle;

      // 2. ★ 激しい台パン（机バンバン！）
      // 前方に突き出した腕を上下に激しく叩きつける
      const slamFreq = isOverdrive ? 26 : 16;
      // 左右でわずかに位相をずらしつつ両手でドンドン叩く
      const rightSlam = Math.sin(t * slamFreq) * (isOverdrive ? 0.65 : 0.45);
      const leftSlam = Math.sin(t * slamFreq + 0.5) * (isOverdrive ? 0.65 : 0.45);

      if (rightArmRef.current) {
        // -1.4 (前方水平) から下へ叩きつける
        rightArmRef.current.rotation.x = -1.4 + rightSlam;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -1.4 + leftSlam;
      }
    } else {
      if (rightEarRef.current) rightEarRef.current.rotation.x = 0;
      if (leftEarRef.current) leftEarRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.1;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.1;
    }
  });

  return (
    <group>
      {/* 胴体 (Bear Body) */}
      <mesh name="Body" castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.38, 0.44, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* カフェエプロン (Barista Apron) */}
      <group position={[0, 0.24, 0.155]}>
        {/* エプロン胸当て */}
        <mesh castShadow position={[0, 0.04, 0]}>
          <boxGeometry args={[0.26, 0.32, 0.01]} />
          <meshStandardMaterial color={accentColor} roughness={0.6} />
        </mesh>
        {/* エプロンポケット */}
        <mesh position={[0, -0.06, 0.006]}>
          <boxGeometry args={[0.16, 0.1, 0.005]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
        {/* ペン (ポケットに挿したボクセルペン) */}
        <mesh position={[0.04, -0.02, 0.008]}>
          <boxGeometry args={[0.02, 0.08, 0.004]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* 頭部グループ */}
      <group position={[0, 0.62, 0.02]}>
        {/* 頭本体 */}
        <mesh name="Head" castShadow>
          <boxGeometry args={[0.34, 0.3, 0.32]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>

        {/* マズル (口元) */}
        <mesh castShadow position={[0, -0.05, 0.16]}>
          <boxGeometry args={[0.18, 0.14, 0.08]} />
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </mesh>

        {/* 鼻 (Brown Nose) */}
        <mesh position={[0, -0.01, 0.205]}>
          <boxGeometry args={[0.06, 0.05, 0.02]} />
          <meshStandardMaterial color="#3f1e07" roughness={0.5} />
        </mesh>

        {/* 目 (Eyes) */}
        <mesh position={[0.08, 0.03, 0.165]}>
          <boxGeometry args={[0.03, 0.04, 0.01]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
        <mesh position={[-0.08, 0.03, 0.165]}>
          <boxGeometry args={[0.03, 0.04, 0.01]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>

        {/* 耳 (Ears) - 喋るとピコピコ動く */}
        {/* 右耳 */}
        <group ref={rightEarRef} position={[0.16, 0.18, -0.02]} rotation={[0, 0, 0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.1, 0.06]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0, 0.031]}>
            <boxGeometry args={[0.06, 0.06, 0.01]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
        {/* 左耳 */}
        <group ref={leftEarRef} position={[-0.16, 0.18, -0.02]} rotation={[0, 0, -0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.1, 0.06]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0, 0.031]}>
            <boxGeometry args={[0.06, 0.06, 0.01]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
      </group>

      {/* 腕 (Arms) - ピボットを肩に設定して台パン連打！ */}
      <group ref={rightArmRef} position={[0.24, 0.42, 0.06]} rotation={[-1.1, 0, 0]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.1, 0.32, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <group ref={leftArmRef} position={[-0.24, 0.42, 0.06]} rotation={[-1.1, 0, 0]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.1, 0.32, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* 小さな丸いしっぽ (Tail) */}
      <mesh castShadow position={[0, 0.1, -0.16]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 脚 (Legs) - 着席・直立ポーズ */}
      {isSitting ? (
        <group name="Legs_Sitting" position={[0, 0.05, 0.12]}>
          {/* 着席時: 脚を前方に伸ばす */}
          <mesh castShadow position={[0.1, 0, 0.12]}>
            <boxGeometry args={[0.11, 0.1, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[-0.1, 0, 0.12]}>
            <boxGeometry args={[0.11, 0.1, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ) : (
        <group name="Legs_Standing" position={[0, 0.02, 0]}>
          {/* 直立時 */}
          <mesh castShadow position={[0.1, -0.12, 0]}>
            <boxGeometry args={[0.11, 0.28, 0.12]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[-0.1, -0.12, 0]}>
            <boxGeometry args={[0.11, 0.28, 0.12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )}
    </group>
  );
}
