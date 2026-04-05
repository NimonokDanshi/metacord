'use client';

import dynamic from 'next/dynamic';

/**
 * WorldCanvas (R3F) を ssr: false で動的ロード
 */
const WorldCanvas = dynamic(
  () => import('./WorldCanvas').then((mod) => mod.WorldCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-300 text-sm italic">Initializing Voxel World...</p>
        </div>
      </div>
    ),
  }
);

export default function WorldCanvasLoader() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <WorldCanvas />
    </div>
  );
}
