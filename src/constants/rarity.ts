import React from 'react';
import { AvatarRarity } from '@/types/avatar';

export interface RarityConfig {
  id: AvatarRarity;
  label: string;
  color: string;           // メインカラー
  accentColor: string;     // シャドウ・アクセントカラー
  textColor: string;       // テキスト色
  borderColor: string;     // 枠線クラス (TailwindまたはHex)
  glowShadow: string;      // グロー効果CSS
  badgeBg: string;         // バッジ背景色
}

export const RARITY_CONFIG: Record<AvatarRarity, RarityConfig> = {
  common: {
    id: 'common',
    label: 'COMMON',
    color: '#94a3b8',
    accentColor: '#64748b',
    textColor: '#f1f5f9',
    borderColor: 'border-slate-500/40',
    glowShadow: 'shadow-[0_0_8px_rgba(148,163,184,0.2)]',
    badgeBg: 'bg-slate-700/80',
  },
  rare: {
    id: 'rare',
    label: 'RARE',
    color: '#3b82f6',
    accentColor: '#1d4ed8',
    textColor: '#eff6ff',
    borderColor: 'border-blue-500/50',
    glowShadow: 'shadow-[0_0_12px_rgba(59,130,246,0.35)]',
    badgeBg: 'bg-blue-900/80',
  },
  epic: {
    id: 'epic',
    label: 'EPIC',
    color: '#a855f7',
    accentColor: '#7e22ce',
    textColor: '#faf5ff',
    borderColor: 'border-purple-500/60',
    glowShadow: 'shadow-[0_0_14px_rgba(168,85,247,0.45)]',
    badgeBg: 'bg-purple-900/80',
  },
  legendary: {
    id: 'legendary',
    label: 'LEGENDARY',
    color: '#f59e0b',
    accentColor: '#b45309',
    textColor: '#fffbeb',
    borderColor: 'border-amber-400/80',
    glowShadow: 'shadow-[0_0_16px_rgba(245,158,11,0.5)]',
    badgeBg: 'bg-amber-950/80',
  },
  ultimate: {
    id: 'ultimate',
    label: 'ULTIMATE',
    color: '#ec4899',
    accentColor: '#be185d',
    textColor: '#fff1f2',
    borderColor: 'border-pink-500',
    glowShadow: 'shadow-[0_0_20px_rgba(236,72,153,0.65)]',
    badgeBg: 'bg-gradient-to-r from-pink-900/90 via-purple-900/90 to-indigo-900/90',
  },
};
