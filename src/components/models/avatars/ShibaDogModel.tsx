import React from 'react';
import { AvatarModelProps } from '@/types/avatar';

/**
 * ShibaDogModel (Rare)
 * 愛らしいボクセル柴犬のアバター
 * - ピンと立った三角耳と、くるんとした巻き尾、赤い首輪が特徴
 * - 着席時 (isSitting = true) はお行儀よく「おすわり」ポーズに変化
 * - 喋っている間 (isSpeaking = true) は耳が前後にパタパタ動きます
 */
export function ShibaDogModel({
  color = '#c27838',          // 柴犬の赤茶（フォーン）
  skinColor = '#fdfbf7',      // お腹・頬・足先の白毛 (ウラジロ)
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  // 耳のパタパタ角度 (喋っている時)
  const earWiggle = isSpeaking ? 0.25 : 0;

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
          {/* 口元の白 */}
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.12, 0.12]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </mesh>
          {/* 黒い鼻 */}
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

        {/* 柴犬の麻呂眉 (眉毛の白い斑点) */}
        <mesh position={[0.08, 0.12, 0.142]}>
          <boxGeometry args={[0.04, 0.03, 0.01]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[-0.08, 0.12, 0.142]}>
          <boxGeometry args={[0.04, 0.03, 0.01]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* 三角耳 (Ears) - 喋るとパタパタ動く */}
        {/* 右耳 */}
        <group position={[0.12, 0.18, -0.02]} rotation={[-earWiggle, 0, 0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.12, 0.06]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, -0.01, 0.031]}>
            <boxGeometry args={[0.05, 0.08, 0.01]} />
            <meshStandardMaterial color="#fda4af" />
          </mesh>
        </group>
        {/* 左耳 */}
        <group position={[-0.12, 0.18, -0.02]} rotation={[-earWiggle, 0, -0.15]}>
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
      <group position={[0, 0.36, -0.26]} rotation={[0.4, 0, 0]}>
        {/* 根元 */}
        <mesh castShadow position={[0, 0.06, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.08]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* 巻き返しの先端 (白混じり) */}
        <mesh castShadow position={[0, 0.12, 0.06]} rotation={[-0.6, 0, 0]}>
          <boxGeometry args={[0.07, 0.1, 0.07]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* 脚 (Legs) - おすわり(着席) と 立ちポーズの切り替え */}
      {isSitting ? (
        <group name="Legs_Sitting">
          {/* 前足 (まっすぐ床について姿勢を保つ) */}
          <mesh castShadow position={[0.1, 0.09, 0.08]}>
            <boxGeometry args={[0.09, 0.18, 0.09]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <mesh castShadow position={[-0.1, 0.09, 0.08]}>
            <boxGeometry args={[0.09, 0.18, 0.09]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* 後ろ足 (おすわりポーズ: 横に折り曲げて接地) */}
          <mesh castShadow position={[0.14, 0.06, -0.16]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[-0.14, 0.06, -0.16]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* 後ろ足先の白 */}
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
          {/* 足先の白 */}
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
