import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FurnitureModelProps } from '@/types/furniture';
import { HEIGHT_CHAIR_SEAT } from '@/constants/voxel';

/**
 * Legendary ロケットゲーミングチェア (RocketGamingChair)
 * - レアリティ: LEGENDARY
 * - 背面にロケットブースターを搭載したハイテクチェア
 * - ボイス音量 (voiceVolume) に連動してRGBネオンがパルス発光
 * - 大声シャウト (isShouting) 時にブースター点火＆椅子ごとアバターと上空へ急上昇！
 */
export function RocketGamingChair({
  pos = { x: 0, y: 0, z: 0 },
  rotation = 0,
  isOccupied = false,
  isSpeaking = false,
  voiceVolume = 0,
  isShouting = false,
}: FurnitureModelProps) {
  const chairGroupRef = useRef<THREE.Group>(null);
  const thrusterFlameRef = useRef<THREE.Group>(null);
  const hoverOffsetRef = useRef<number>(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // シャウト時のロケット浮上
    if (isShouting) {
      hoverOffsetRef.current = THREE.MathUtils.lerp(hoverOffsetRef.current, 1.4, delta * 8);
    } else if (isSpeaking) {
      hoverOffsetRef.current = THREE.MathUtils.lerp(hoverOffsetRef.current, 0.1, delta * 5);
    } else {
      hoverOffsetRef.current = THREE.MathUtils.lerp(hoverOffsetRef.current, 0, delta * 6);
    }

    if (chairGroupRef.current) {
      const shake = isShouting ? (Math.random() - 0.5) * 0.05 : 0;
      chairGroupRef.current.position.y = pos.y + hoverOffsetRef.current + shake;
      // ロケット噴射中の小刻みな揺れ
      chairGroupRef.current.rotation.z = isShouting ? Math.sin(t * 25) * 0.04 : 0;
    }

    // 噴射炎スケール
    const flameScale = isShouting 
      ? 1.2 + Math.sin(t * 40) * 0.4 + Math.random() * 0.2
      : isSpeaking 
      ? 0.3 + (voiceVolume * 0.4) 
      : 0;

    if (thrusterFlameRef.current) {
      thrusterFlameRef.current.scale.set(flameScale, flameScale * 1.6, flameScale);
      thrusterFlameRef.current.visible = flameScale > 0.05;
    }
  });

  const neonColor = isShouting ? '#ff0055' : isSpeaking ? '#00f0ff' : '#6366f1';

  return (
    <group ref={chairGroupRef} position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      {/* キャスターベース */}
      {[0, Math.PI / 2.5, Math.PI * 2 / 2.5, Math.PI * 3 / 2.5, Math.PI * 4 / 2.5].map((rot, i) => (
        <group key={i} rotation={[0, rot, 0]}>
          <mesh castShadow position={[0.2, 0.04, 0]}>
            <boxGeometry args={[0.3, 0.04, 0.06]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.32, 0.03, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
        </group>
      ))}

      {/* 油圧シリンダー支柱 */}
      <mesh castShadow position={[0, (HEIGHT_CHAIR_SEAT - 0.06) / 2, 0]}>
        <cylinderGeometry args={[0.045, 0.045, HEIGHT_CHAIR_SEAT - 0.06, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* バケット座面 */}
      <mesh castShadow receiveShadow position={[0, HEIGHT_CHAIR_SEAT - 0.04, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.55]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.4} />
      </mesh>
      {/* サイドサポートクッション */}
      {[-0.26, 0.26].map((x, i) => (
        <mesh key={i} castShadow position={[x, HEIGHT_CHAIR_SEAT + 0.02, 0]}>
          <boxGeometry args={[0.06, 0.08, 0.5]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
      ))}

      {/* ネオンエッジストリップ */}
      <mesh position={[0, HEIGHT_CHAIR_SEAT - 0.03, 0.27]}>
        <boxGeometry args={[0.52, 0.02, 0.02]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>

      {/* ハイバック背もたれ */}
      <group position={[0, HEIGHT_CHAIR_SEAT + 0.42, -0.22]}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.52, 0.76, 0.08]} />
          <meshStandardMaterial color="#0b0f19" />
        </mesh>
        {/* レーシングストライプ (ネオン) */}
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[0.1, 0.68]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
        {/* ヘッドレストピロー */}
        <mesh castShadow position={[0, 0.28, 0.05]}>
          <boxGeometry args={[0.26, 0.12, 0.05]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
      </group>

      {/* アームレスト */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={i} position={[x, HEIGHT_CHAIR_SEAT + 0.18, 0]}>
          <mesh castShadow position={[0, -0.08, 0]}>
            <boxGeometry args={[0.04, 0.18, 0.06]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh castShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[0.07, 0.02, 0.32]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
        </group>
      ))}

      {/* ===================== 背面ロケットブースターユニット ===================== */}
      <group position={[0, HEIGHT_CHAIR_SEAT + 0.25, -0.32]}>
        {/* ブースターマウントフレーム */}
        <mesh castShadow position={[0, 0, 0.04]}>
          <boxGeometry args={[0.3, 0.24, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* ツインロケットノズル */}
        {[-0.1, 0.1].map((x, i) => (
          <group key={i} position={[x, -0.08, 0]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.065, 0.09, 0.18, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.09]}>
              <ringGeometry args={[0.03, 0.065, 12]} />
              <meshBasicMaterial color="#ffd700" />
            </mesh>
          </group>
        ))}

        {/* 噴射炎 */}
        <group 
          ref={thrusterFlameRef} 
          position={[0, -0.16, -0.09]} 
          rotation={[Math.PI / 2, 0, 0]}
        >
          <mesh position={[-0.1, 0.18, 0]}>
            <coneGeometry args={[0.08, 0.45, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.1, 0.3, 0]}>
            <coneGeometry args={[0.13, 0.7, 8]} />
            <meshBasicMaterial color={isShouting ? '#ff0055' : '#00f0ff'} transparent opacity={0.85} />
          </mesh>

          <mesh position={[0.1, 0.18, 0]}>
            <coneGeometry args={[0.08, 0.45, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.1, 0.3, 0]}>
            <coneGeometry args={[0.13, 0.7, 8]} />
            <meshBasicMaterial color={isShouting ? '#ff0055' : '#00f0ff'} transparent opacity={0.85} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
