'use client';

import React, { useEffect } from 'react';
import { useRoomStore } from '@/stores/roomStore';

export function RoomToasts() {
  const { toasts, removeToast } = useRoomStore();

  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      toasts.forEach((t) => {
        if (now - t.timestamp > 3500) {
          removeToast(t.id);
        }
      });
    }, 500);

    return () => clearInterval(timer);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none select-none">
      {toasts.map((toast) => {
        const isJoin = toast.type === 'join';
        const isLeave = toast.type === 'leave';

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg border backdrop-blur-md transition-all animate-bounce ${
              isJoin
                ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                : isLeave
                ? 'bg-rose-950/90 border-rose-400/80 text-rose-200 shadow-[0_0_15px_rgba(251,113,133,0.4)]'
                : 'bg-slate-900/90 border-blue-400/80 text-blue-200 shadow-[0_0_15px_rgba(96,165,250,0.4)]'
            }`}
          >
            <span className="text-sm">
              {isJoin ? '✨' : isLeave ? '💨' : '📢'}
            </span>
            <span className="text-xs font-bold tracking-wide">
              {toast.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
