'use client';

import { useEffect, useRef } from 'react';
import { useApplication } from '@pixi/react';
import { Graphics } from 'pixi.js';
import {
  TILE_W,
  TILE_H,
  GRID_COLS,
  GRID_ROWS,
  COLOR_FLOOR_A,
  COLOR_FLOOR_B,
  COLOR_GRID,
  COLOR_WALL,
} from '@/constants/layout';

/**
 * 部屋の背景（フロア・壁）を描画するコンポーネント
 * useApplication()でPixiJSのappインスタンスを取得し、
 * Graphicsオブジェクトを直接stageに追加する
 */
export default function Room() {
  const { app } = useApplication();
  const graphicsRef = useRef<Graphics | null>(null);

  useEffect(() => {
    const g = new Graphics();
    graphicsRef.current = g;

    // フロアタイルを描画（チェッカーパターン）
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * TILE_W;
        const y = row * TILE_H;
        // 市松模様にする
        const isEven = (row + col) % 2 === 0;
        const fillColor = isEven ? COLOR_FLOOR_A : COLOR_FLOOR_B;

        // タイル本体
        g.rect(x + 1, y + 1, TILE_W - 2, TILE_H - 2).fill(fillColor);
        // グリッドライン
        g.rect(x, y, TILE_W, TILE_H).stroke({ width: 1, color: COLOR_GRID, alpha: 0.6 });
      }
    }

    // 上部の簡易的な壁（奥の壁）
    g.rect(0, -32, TILE_W * GRID_COLS, 32).fill(COLOR_WALL);

    app.stage.addChildAt(g, 0); // 一番奥に追加

    return () => {
      app.stage.removeChild(g);
      g.destroy();
    };
  }, [app]);

  return null;
}
