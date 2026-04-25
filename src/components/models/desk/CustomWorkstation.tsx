import React from 'react';
import { HEIGHT_DESK } from '@/constants/voxel';
import { Desk } from './Desk';
import { Chair } from '../chair/Chair';
import { Monitor } from '../parts/Monitor';
import { Keyboard } from '../parts/Keyboard';
import { Mouse } from '../parts/Mouse';
import { PCCase } from '../parts/PCCase';

export function CustomWorkstation({ pos = { x: 0, y: 0, z: 0 }, rotation = 0 }: { pos?: { x: number; y: number; z: number }, rotation?: number }) {
  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, rotation, 0]}>
      <Desk pos={{ x: 0, y: 0, z: 0 }} />
      {/* セットの椅子 */}
      <Chair pos={{ x: 0.5, y: 0, z: 1.25 }} rotation={Math.PI} />
      {/* 卓上機材 (2枚のモニター等) */}
      <group position={[0, HEIGHT_DESK, 0]}>
        <group position={[-0.4, 0, 0]} rotation={[0, 0.2, 0]}>
          <Monitor />
        </group>
        <group position={[0.4, 0, 0]} rotation={[0, -0.2, 0]}>
          <Monitor />
        </group>
        <group position={[0, 0, 0.25]}>
          <Keyboard />
        </group>
        <group position={[0.35, 0.015, 0.25]}>
          <Mouse />
        </group>
        <group position={[0.7, 0.225, -0.05]}>
          <PCCase />
        </group>
      </group>
    </group>
  );
}
