'use client';

import { useState } from 'react';
import { useDiscordStore } from '@/store/discordStore';

export default function DebugOverlay() {
  const [showDebug, setShowDebug] = useState(false);
  const {
    instanceId, channelId, guildId, voiceStates, isReady,
    rawChannelData, logMessages,
  } = useDiscordStore();

  return (
    <div className="fixed top-4 left-4 z-[9999]">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-slate-800/80 hover:bg-slate-700 text-white text-[10px] px-2 py-1 rounded border border-slate-600 backdrop-blur-sm transition-colors shadow-lg"
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>

      {showDebug && (
        <div
          className="fixed top-12 left-4 w-96 max-h-[80vh] min-h-[300px] min-w-[300px] bg-slate-950/90 text-white p-4 rounded-lg shadow-2xl border border-white/20 z-[10000] text-[10px] font-mono backdrop-blur-md animate-in fade-in slide-in-from-top-2 overflow-auto"
          style={{ resize: 'both' }}
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3 sticky top-0 bg-slate-950/20 backdrop-blur-sm z-10">
            <h3 className="text-xs font-bold text-cyan-400">ZUSTAND STORE DEBUG</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[9px] uppercase tracking-wider">{isReady ? 'READY' : 'WAITING'}</span>
            </div>
          </div>

          <section className="space-y-4">
            <div>
              <h4 className="text-white/40 mb-1 uppercase tracking-tighter">Context:</h4>
              <div className="grid grid-cols-2 gap-1 text-[9px] pl-2 border-l border-white/10">
                <span className="text-white/60">InstanceId:</span> <span className="text-white truncate">{instanceId || 'null'}</span>
                <span className="text-white/60">ChannelId:</span> <span className="text-white truncate">{channelId || 'null'}</span>
                <span className="text-white/60">GuildId:</span> <span className="text-white truncate">{guildId || 'null'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-white/40 mb-1 uppercase tracking-tighter flex justify-between">
                <span>Voice States:</span>
                <span className="text-emerald-500">{voiceStates.length} users</span>
              </h4>
              <div className="space-y-1">
                {voiceStates.map((vs) => (
                  <div key={vs.user.id} className="p-1 px-2 bg-slate-900/30 rounded border border-slate-800/50 flex justify-between items-center">
                    <span className="truncate max-w-[120px]">{vs.user.global_name || vs.user.username}</span>
                    <span className="flex gap-2">
                      {vs.voice_state?.self_mute && <span title="Muted">🔇</span>}
                      {vs.voice_state?.self_deaf && <span title="Deafened">🎧</span>}
                    </span>
                  </div>
                ))}
                {voiceStates.length === 0 && <div className="text-slate-600 italic">No participants list.</div>}
              </div>
            </div>

            <div>
              <h4 className="text-white/40 mb-1 uppercase tracking-tighter text-cyan-500">Live Logs (Last 20):</h4>
              <div className="bg-black/50 p-2 rounded max-h-48 overflow-y-auto text-[9px] space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                {logMessages.map((m, i) => (
                  <div key={i} className="border-b border-white/5 pb-1 last:border-0 leading-relaxed">
                    <span className="text-white/30 mr-1">[{logMessages.length - i}]</span>
                    {m}
                  </div>
                ))}
                {logMessages.length === 0 && <div className="text-slate-600 italic">No logs yet.</div>}
              </div>
            </div>

            <div>
              <h4 className="text-white/40 mb-1 uppercase tracking-tighter text-yellow-500">Raw Channel Data:</h4>
              <pre className="bg-black/50 p-2 rounded max-h-40 overflow-y-auto whitespace-pre-wrap break-all text-[8px] text-yellow-200/80 font-mono">
                {rawChannelData ? JSON.stringify(rawChannelData, null, 2) : 'No data fetched yet.'}
              </pre>
            </div>
          </section>

          <button
            onClick={() => setShowDebug(false)}
            className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded transition-colors text-[9px] uppercase tracking-widest border border-white/10 text-white/60 hover:text-white"
          >
            Hide Debug
          </button>
        </div>
      )}
    </div>
  );
}
