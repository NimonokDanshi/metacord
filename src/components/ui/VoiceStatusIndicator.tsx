'use client';
 
import React from 'react';
 
export function VoiceStatusIndicator() {
  const [isActive, setIsActive] = React.useState(false);
 
  // 簡易的に Web Speech API が動いているかを確認する（本来は global state が望ましい）
  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsActive(true);
    }
  }, []);
 
  if (!isActive) return null;
 
  return (
    <div className="absolute bottom-24 right-6 z-[60] pointer-events-none">
      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-2xl">
        <div className="flex gap-1 items-center h-4">
          <div className="w-1 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_0ms]" style={{ height: '60%' }}></div>
          <div className="w-1 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_200ms]" style={{ height: '100%' }}></div>
          <div className="w-1 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_400ms]" style={{ height: '70%' }}></div>
          <div className="w-1 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_100ms]" style={{ height: '90%' }}></div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-cyan-300 tracking-wider uppercase opacity-80">Voice Command</span>
          <span className="text-[8px] text-white/60">Say "移動" to change seat</span>
        </div>
      </div>
    </div>
  );
}
