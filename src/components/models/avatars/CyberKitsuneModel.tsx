import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarModelProps } from '@/types/avatar';
import { AvatarRarityEffects } from '@/components/models/avatars/common/AvatarRarityEffects';

/**
 * CyberKitsuneModel (Legendary)
 * サイバー狐面、ネオンイヤー、サイバー羽織、そして優美にうねる2本の光るネオンテイルを備えた狐型サイボーグ
 * - 発言時 (isSpeaking = true): 狐面のネオンアイがブースト発光し、2本の尾が優美に大きくうねる
 * - 着席時 (isSitting = true): 足を折りたたみ、尾を体のサイドに流して着席
 */
export function CyberKitsuneModel({
  color = '#f8fafc',          // 白狐のサイバー装甲・羽織
  skinColor = '#0f172a',      // インナーサイバースーツ（ダークネイビー）
  accentColor = '#00f0ff',    // ネオンシアン（エナジーライン & ネオンテイル先端）
  isSitting = false,
  isSpeaking = false,
}: AvatarModelProps) {
  const maskEyeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const earTipMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const tail1BaseRef = useRef<THREE.Group>(null);
  const tail1MidRef = useRef<THREE.Group>(null);
  const tail2BaseRef = useRef<THREE.Group>(null);
  const tail2MidRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);

  const neonRed = '#f43f5e';  // 隈取（くまどり）サイバーレッド
  const goldKnot = '#fbbf24'; // 帯留めゴールド

  // アニメーション処理 (60fps)
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (isSpeaking) {
      // 狐面のネオンアイ・耳先のブースト発光
      const boost = (Math.sin(t * 16) * 0.5 + 0.5) * 2.5 + 1.8;
      if (maskEyeMatRef.current) maskEyeMatRef.current.emissiveIntensity = boost;
      if (earTipMatRef.current) earTipMatRef.current.emissiveIntensity = boost;

      // 狐耳のピクピク動作
      const earTwitch = Math.sin(t * 14) * 0.15;
      if (rightEarRef.current) rightEarRef.current.rotation.z = -0.15 + earTwitch;
      if (leftEarRef.current) leftEarRef.current.rotation.z = 0.15 - earTwitch;

      // 2本の尾のダイナミックかつ優美なうねり (位相を反転させて波打たせる)
      const baseWave1 = Math.sin(t * 6) * 0.45;
      const baseWave2 = Math.cos(t * 6) * 0.45;
      const midWave1 = Math.sin(t * 6 + 1.2) * 0.35;
      const midWave2 = Math.cos(t * 6 + 1.2) * 0.35;

      if (isSitting) {
        // 座席時はサイドに流しつつうねる
        if (tail1BaseRef.current) {
          tail1BaseRef.current.rotation.y = 0.8 + baseWave1 * 0.5;
          tail1BaseRef.current.rotation.x = -0.2 + Math.sin(t * 5) * 0.15;
        }
        if (tail1MidRef.current) tail1MidRef.current.rotation.y = 0.6 + midWave1 * 0.5;

        if (tail2BaseRef.current) {
          tail2BaseRef.current.rotation.y = -0.8 - baseWave2 * 0.5;
          tail2BaseRef.current.rotation.x = -0.2 + Math.cos(t * 5) * 0.15;
        }
        if (tail2MidRef.current) tail2MidRef.current.rotation.y = -0.6 - midWave2 * 0.5;
      } else {
        // 立位時のダイナミックなうねり
        if (tail1BaseRef.current) {
          tail1BaseRef.current.rotation.y = 0.3 + baseWave1;
          tail1BaseRef.current.rotation.x = 0.4 + Math.sin(t * 5) * 0.2;
        }
        if (tail1MidRef.current) tail1MidRef.current.rotation.y = 0.2 + midWave1;

        if (tail2BaseRef.current) {
          tail2BaseRef.current.rotation.y = -0.3 - baseWave2;
          tail2BaseRef.current.rotation.x = 0.4 + Math.cos(t * 5) * 0.2;
        }
        if (tail2MidRef.current) tail2MidRef.current.rotation.y = -0.2 - midWave2;
      }
    } else {
      // 通常時 (優美なアイドルうねり)
      if (maskEyeMatRef.current) maskEyeMatRef.current.emissiveIntensity = 1.2;
      if (earTipMatRef.current) earTipMatRef.current.emissiveIntensity = 1.2;

      if (rightEarRef.current) rightEarRef.current.rotation.z = -0.15;
      if (leftEarRef.current) leftEarRef.current.rotation.z = 0.15;

      const idleWave1 = Math.sin(t * 2.5) * 0.18;
      const idleWave2 = Math.cos(t * 2.5) * 0.18;

      if (isSitting) {
        if (tail1BaseRef.current) {
          tail1BaseRef.current.rotation.y = 0.75 + idleWave1;
          tail1BaseRef.current.rotation.x = -0.2;
        }
        if (tail1MidRef.current) tail1MidRef.current.rotation.y = 0.45;

        if (tail2BaseRef.current) {
          tail2BaseRef.current.rotation.y = -0.75 - idleWave2;
          tail2BaseRef.current.rotation.x = -0.2;
        }
        if (tail2MidRef.current) tail2MidRef.current.rotation.y = -0.45;
      } else {
        if (tail1BaseRef.current) {
          tail1BaseRef.current.rotation.y = 0.25 + idleWave1;
          tail1BaseRef.current.rotation.x = 0.35;
        }
        if (tail1MidRef.current) tail1MidRef.current.rotation.y = 0.15;

        if (tail2BaseRef.current) {
          tail2BaseRef.current.rotation.y = -0.25 - idleWave2;
          tail2BaseRef.current.rotation.x = 0.35;
        }
        if (tail2MidRef.current) tail2MidRef.current.rotation.y = -0.15;
      }
    }
  });

  return (
    <group>
      {/* 胴体インナー (Cyber Body Suit) */}
      <mesh name="Torso" castShadow position={[0, 0.40, 0]}>
        <boxGeometry args={[0.34, 0.42, 0.24]} />
        <meshStandardMaterial color={skinColor} roughness={0.4} />
      </mesh>

      {/* サイバー羽織 (Cyber Haori Armor: 白外装) */}
      <group position={[0, 0.42, 0]}>
        {/* 背中プレート */}
        <mesh castShadow position={[0, 0, -0.125]}>
          <boxGeometry args={[0.38, 0.40, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* 右羽織前身頃 */}
        <mesh castShadow position={[0.13, 0, 0.125]}>
          <boxGeometry args={[0.12, 0.40, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* 左羽織前身頃 */}
        <mesh castShadow position={[-0.13, 0, 0.125]}>
          <boxGeometry args={[0.12, 0.40, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* 胸元のネオンシアンライン */}
        <mesh position={[0.07, 0, 0.13]}>
          <boxGeometry args={[0.015, 0.38, 0.03]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
          />
        </mesh>
        <mesh position={[-0.07, 0, 0.13]}>
          <boxGeometry args={[0.015, 0.38, 0.03]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* 帯 (Obi & Cyber Sash) */}
      <group position={[0, 0.28, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.36, 0.10, 0.26]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        {/* 帯締めネオンレッド */}
        <mesh position={[0, 0, 0.132]}>
          <boxGeometry args={[0.34, 0.02, 0.005]} />
          <meshStandardMaterial
            color={neonRed}
            emissive={neonRed}
            emissiveIntensity={1.4}
          />
        </mesh>
        {/* ゴールド帯留め */}
        <mesh castShadow position={[0, 0, 0.135]}>
          <boxGeometry args={[0.06, 0.04, 0.01]} />
          <meshStandardMaterial color={goldKnot} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 頭部: サイバー狐面 (Cyber Kitsune Mask & Head) */}
      <group position={[0, 0.70, 0]}>
        {/* インナーヘッド */}
        <mesh name="Head" castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.26, 0.24, 0.24]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* 狐面ベースプレート (White Mask Face) */}
        <mesh castShadow position={[0, 0.02, 0.11]}>
          <boxGeometry args={[0.28, 0.26, 0.06]} />
          <meshStandardMaterial color={color} roughness={0.2} />
        </mesh>

        {/* 狐面のマズル (Fox Snout) */}
        <group position={[0, -0.04, 0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.10, 0.08, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.2} />
          </mesh>
          {/* 黒い鼻先 */}
          <mesh position={[0, 0.025, 0.042]}>
            <boxGeometry args={[0.03, 0.02, 0.01]} />
            <meshStandardMaterial color="#09090b" />
          </mesh>
        </group>

        {/* ネオンアイ (Slit Neon Eyes: useFrameでブースト明滅) */}
        <mesh position={[0.07, 0.03, 0.145]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.07, 0.02, 0.005]} />
          <meshStandardMaterial
            ref={maskEyeMatRef}
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
          />
        </mesh>
        <mesh position={[-0.07, 0.03, 0.145]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.07, 0.02, 0.005]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
          />
        </mesh>

        {/* 隈取（くまどり）サイバーレッドマーキング */}
        {/* 目の上のアイブロウライン */}
        <mesh position={[0.07, 0.065, 0.143]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.06, 0.015, 0.005]} />
          <meshStandardMaterial
            color={neonRed}
            emissive={neonRed}
            emissiveIntensity={1.5}
          />
        </mesh>
        <mesh position={[-0.07, 0.065, 0.143]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.06, 0.015, 0.005]} />
          <meshStandardMaterial
            color={neonRed}
            emissive={neonRed}
            emissiveIntensity={1.5}
          />
        </mesh>
        {/* 頬の隈取スリット */}
        <mesh position={[0.11, -0.03, 0.143]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.05, 0.015, 0.005]} />
          <meshStandardMaterial
            color={neonRed}
            emissive={neonRed}
            emissiveIntensity={1.5}
          />
        </mesh>
        <mesh position={[-0.11, -0.03, 0.143]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.05, 0.015, 0.005]} />
          <meshStandardMaterial
            color={neonRed}
            emissive={neonRed}
            emissiveIntensity={1.5}
          />
        </mesh>

        {/* 立ち狐耳 (Kitsune Ears) */}
        {/* 右耳 */}
        <group ref={rightEarRef} position={[0.11, 0.14, 0]} rotation={[0, 0, -0.15]}>
          <mesh castShadow position={[0, 0.08, 0]}>
            <boxGeometry args={[0.09, 0.16, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* 耳内側 (Dark & Red) */}
          <mesh position={[-0.01, 0.07, 0.041]}>
            <boxGeometry args={[0.05, 0.12, 0.005]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* 先端ネオンチップ */}
          <mesh position={[0, 0.17, 0]}>
            <boxGeometry args={[0.05, 0.04, 0.05]} />
            <meshStandardMaterial
              ref={earTipMatRef}
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>

        {/* 左耳 */}
        <group ref={leftEarRef} position={[-0.11, 0.14, 0]} rotation={[0, 0, 0.15]}>
          <mesh castShadow position={[0, 0.08, 0]}>
            <boxGeometry args={[0.09, 0.16, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* 耳内側 */}
          <mesh position={[0.01, 0.07, 0.041]}>
            <boxGeometry args={[0.05, 0.12, 0.005]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* 先端ネオンチップ */}
          <mesh position={[0, 0.17, 0]}>
            <boxGeometry args={[0.05, 0.04, 0.05]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      </group>

      {/* 腕 (Arms) */}
      {/* 左腕 */}
      <group position={[-0.22, 0.44, 0]}>
        {/* 白い羽織袖 */}
        <mesh castShadow position={[0, -0.06, 0]}>
          <boxGeometry args={[0.11, 0.20, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* インナー前腕 */}
        <mesh castShadow position={[0, -0.20, 0]}>
          <boxGeometry args={[0.08, 0.14, 0.08]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* ネオンアームバンド */}
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[0.086, 0.02, 0.086]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* 右腕 */}
      <group position={[0.22, 0.44, 0]}>
        {/* 白い羽織袖 */}
        <mesh castShadow position={[0, -0.06, 0]}>
          <boxGeometry args={[0.11, 0.20, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* インナー前腕 */}
        <mesh castShadow position={[0, -0.20, 0]}>
          <boxGeometry args={[0.08, 0.14, 0.08]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* ネオンアームバンド */}
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[0.086, 0.02, 0.086]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* 背中: 2本の光るネオンテイル (Dual Neon Tails) */}
      <group position={[0, 0.26, -0.12]}>
        {/* 第1の尾 (右側) */}
        <group ref={tail1BaseRef} position={[0.06, 0, 0]}>
          {/* 尾 根元 */}
          <mesh castShadow position={[0, 0.06, -0.08]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.10, 0.14, 0.10]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>

          {/* 尾 中間節 */}
          <group ref={tail1MidRef} position={[0, 0.14, -0.14]}>
            <mesh castShadow position={[0, 0.08, -0.08]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.11, 0.18, 0.11]} />
              <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            {/* 尾 中間ネオンライン */}
            <mesh position={[0, 0.08, -0.138]}>
              <boxGeometry args={[0.02, 0.16, 0.01]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={1.8}
              />
            </mesh>

            {/* 尾 先端 (エナジー発光) */}
            <mesh position={[0, 0.20, -0.14]} rotation={[0.6, 0, 0]}>
              <boxGeometry args={[0.08, 0.14, 0.08]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={isSpeaking ? 3.0 : 1.6}
              />
            </mesh>
          </group>
        </group>

        {/* 第2の尾 (左側) */}
        <group ref={tail2BaseRef} position={[-0.06, 0, 0]}>
          {/* 尾 根元 */}
          <mesh castShadow position={[0, 0.06, -0.08]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.10, 0.14, 0.10]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>

          {/* 尾 中間節 */}
          <group ref={tail2MidRef} position={[0, 0.14, -0.14]}>
            <mesh castShadow position={[0, 0.08, -0.08]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.11, 0.18, 0.11]} />
              <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            {/* 尾 中間ネオンライン */}
            <mesh position={[0, 0.08, -0.138]}>
              <boxGeometry args={[0.02, 0.16, 0.01]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={1.8}
              />
            </mesh>

            {/* 尾 先端 (エナジー発光) */}
            <mesh position={[0, 0.20, -0.14]} rotation={[0.6, 0, 0]}>
              <boxGeometry args={[0.08, 0.14, 0.08]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={isSpeaking ? 3.0 : 1.6}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* 脚 (Legs: isSitting で切り替え) */}
      {isSitting ? (
        <group name="Legs_Sitting" position={[0, 0.10, 0.10]}>
          {/* 折りたたんだサイバー袴/レッグ */}
          <mesh castShadow position={[0.09, 0, 0.06]} rotation={[-Math.PI / 2, 0, 0.1]}>
            <boxGeometry args={[0.10, 0.22, 0.10]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <mesh castShadow position={[-0.09, 0, 0.06]} rotation={[-Math.PI / 2, 0, -0.1]}>
            <boxGeometry args={[0.10, 0.22, 0.10]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* ネオンアクセント */}
          <mesh position={[0.09, 0.03, 0.16]}>
            <boxGeometry args={[0.08, 0.02, 0.06]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.4}
            />
          </mesh>
          <mesh position={[-0.09, 0.03, 0.16]}>
            <boxGeometry args={[0.08, 0.02, 0.06]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.4}
            />
          </mesh>
        </group>
      ) : (
        <group name="Legs_Standing" position={[0, 0.10, 0]}>
          <mesh castShadow position={[0.09, 0, 0]}>
            <boxGeometry args={[0.09, 0.20, 0.10]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <mesh castShadow position={[-0.09, 0, 0]}>
            <boxGeometry args={[0.09, 0.20, 0.10]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* サイバー足袋ブーツ */}
          <mesh castShadow position={[0.09, -0.07, 0.02]}>
            <boxGeometry args={[0.10, 0.06, 0.14]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          <mesh castShadow position={[-0.09, -0.07, 0.02]}>
            <boxGeometry args={[0.10, 0.06, 0.14]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* ソールネオンライン */}
          <mesh position={[0.09, -0.09, 0.02]}>
            <boxGeometry args={[0.08, 0.015, 0.12]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.5}
            />
          </mesh>
          <mesh position={[-0.09, -0.09, 0.02]}>
            <boxGeometry args={[0.08, 0.015, 0.12]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      )}

      {/* レアリティ共通エフェクト */}
      <AvatarRarityEffects
        rarity="legendary"
        isSpeaking={isSpeaking}
        isSitting={isSitting}
        accentColor={accentColor}
      />
    </group>
  );
}
