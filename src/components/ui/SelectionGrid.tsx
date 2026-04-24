import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

/**
 * アイテム選択画面用の汎用グリッドコンポーネント
 */
export function SelectionGrid({ children, className = '' }: Props) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
}
