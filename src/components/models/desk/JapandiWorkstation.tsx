import React from 'react';
import { HEIGHT_DESK } from '@/constants/voxel';
import { JapandiDesk } from './JapandiDesk';
import { JapandiChair } from '../chair/JapandiChair';
import { Monitor } from '../parts/Monitor';
import { Keyboard } from '../parts/Keyboard';
import { Mouse } from '../parts/Mouse';

interface Props {
  pos?: { x: number; y: number; z: number };
  rotation?: number;
}

export function JapandiWorkstation({ pos = { x: 0, y: 0, z: 0 }, rotation = 0 }: Props) {
  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      <JapandiDesk />
      {/* 少し後ろに引いた配置 */}
      <JapandiChair pos={{ x: 0.5, y: 0, z: 1.15 }} rotation={Math.PI} />
      
      {/* 卓上機材 (少しミニマルな配置) */}
      <group position={[0, HEIGHT_DESK, 0]}>
        <Monitor />
        <group position={[0, 0, 0.25]}>
          <Keyboard />
        </group>
        <group position={[0.35, 0.015, 0.25]}>
          <Mouse />
        </group>
      </group>
    </group>
  );
}
