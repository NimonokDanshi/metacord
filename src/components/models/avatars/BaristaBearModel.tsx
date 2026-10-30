import React from 'react';
import { AvatarModelProps } from '@/types/avatar';

/**
 * BaristaBearModel (Common)
 * カフェエプロンを着けた癒やし系のボクセルクマさんアバター
 * - 丸い耳、白いマズル、ダークグリーンのカフェエプロン
 * - 喋っている間 (isSpeaking = true) は耳がピコピコ動きます
 * - 着席時 (isSitting = true) は脚を前方に折り曲げて着席します
 */
export function BaristaBearModel({
  color = '#854d0e',          // 落ち着いたブラウンの毛並み
  skinColor = '#fef3c7',      // マズル・耳の内側のクリーム色
  accentColor = '#15803d',    // 深緑のカフェエプロン
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  // 耳のピコピコ角度
  const earWiggle = isSpeaking ? 0.2 : 0;

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

      {/* 頭部 (Head) */}
      <group position={[0, 0.6, 0.02]}>
        {/* 頭本体 */}
        <mesh name="Head" castShadow>
          <boxGeometry args={[0.36, 0.32, 0.32]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>

        {/* マズル / 口元 (Muzzle) */}
        <group position={[0, -0.05, 0.17]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.14, 0.08]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>
          {/* 黒い鼻 */}
          <mesh castShadow position={[0, 0.03, 0.042]}>
            <boxGeometry args={[0.06, 0.04, 0.02]} />
            <meshStandardMaterial color="#1c1917" roughness={0.3} />
          </mesh>
        </group>

        {/* つぶらな目 (Black Eyes) */}
        <mesh name="Eye_R" castShadow position={[0.09, 0.04, 0.162]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshStandardMaterial color="#1c1917" roughness={0.2} />
        </mesh>
        <mesh name="Eye_L" castShadow position={[-0.09, 0.04, 0.162]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshStandardMaterial color="#1c1917" roughness={0.2} />
        </mesh>

        {/* 丸い耳 (Round Bear Ears - 喋るとピコピコ動く) */}
        {/* 右耳 */}
        <group position={[0.16, 0.18, -0.02]} rotation={[earWiggle, 0, 0.1]}>
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
        <group position={[-0.16, 0.18, -0.02]} rotation={[earWiggle, 0, -0.1]}>
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

      {/* 腕 (Arms) */}
      <mesh name="Arm_R" castShadow position={[0.24, 0.3, 0.06]} rotation={[-1.2, 0, 0]}>
        <boxGeometry args={[0.09, 0.32, 0.09]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh name="Arm_L" castShadow position={[-0.24, 0.3, 0.06]} rotation={[-1.2, 0, 0]}>
        <boxGeometry args={[0.09, 0.32, 0.09]} />
        <meshStandardMaterial color={color} />
      </mesh>

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
