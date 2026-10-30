import React, { useRef } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  /** 横スクロールレイアウト (4x1) を有効にするか (デフォルト: true) */
  scrollable?: boolean;
}

/**
 * アイテム選択画面用の大判カードスクロールグリッド (4x1 対応)
 * 各カードが大きく表示され、横スクロールで一覧を快適に閲覧できます。
 */
export function SelectionGrid({ children, className = '', scrollable = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // マウスホイールの縦スクロールを横スクロールに変換
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (containerRef.current && scrollable) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        containerRef.current.scrollLeft += e.deltaY * 0.8;
      }
    }
  };

  if (!scrollable) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className="relative w-full group/grid">
      {/* 4x1 大判横スクロールコンテナ */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        className={`flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-slate-800/40 ${className}`}
        style={{
          scrollbarGutter: 'stable',
        }}
      >
        {React.Children.map(children, (child) => (
          <div className="flex-none w-[230px] sm:w-[245px] snap-start">
            {child}
          </div>
        ))}
      </div>

      {/* 左右のスクロールナビゲーションヒント */}
      <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-white/40 tracking-wider font-bold">
        <span>◀ SCROLL OR DRAG TO BROWSE ▶</span>
        <span>4 CARDS PER VIEW</span>
      </div>
    </div>
  );
}
