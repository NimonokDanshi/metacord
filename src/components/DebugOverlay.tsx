'use client';

import { useState } from 'react';
import { useDiscordStore } from '@/stores/discordStore';
import { useRoomStore } from '@/stores/roomStore';

type Tab = 'Discord' | 'Room' | 'Sync Flow' | 'Logs';

export default function DebugOverlay() {
  const [showDebug, setShowDebug] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Discord');
  
  const discord = useDiscordStore();
  const room = useRoomStore();

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('ja-JP', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      fractionalSecondDigits: 3 
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'DB_REQ': return 'text-amber-400';
      case 'DB_RES': return 'text-emerald-400';
      case 'REALTIME': return 'text-cyan-400';
      case 'PRESENCE': return 'text-purple-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="fixed top-4 left-4 z-[9999]">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-slate-800/90 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-full border border-slate-600 backdrop-blur-md transition-all shadow-xl flex items-center gap-2 group"
      >
        <span className={`w-2 h-2 rounded-full ${discord.isReady ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="font-bold tracking-tight">{showDebug ? 'CLOSE DEBUG' : 'SHOW DEBUG'}</span>
      </button>

      {showDebug && (
        <div
          className="fixed top-14 left-4 w-[450px] max-h-[85vh] min-h-[400px] bg-slate-950/95 text-white rounded-xl shadow-2xl border border-white/10 z-[10000] flex flex-col backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          style={{ resize: 'both' }}
        >
          {/* Header & Tabs */}
          <div className="p-4 border-b border-white/5 bg-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black tracking-widest text-cyan-400 uppercase italic">Metacord Debugger</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => { discord.clearSyncEvents(); }} 
                  className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 transition-colors"
                >
                  CLEAR SYNC
                </button>
              </div>
            </div>
            <div className="flex gap-1 p-1 bg-black/40 rounded-lg">
              {(['Discord', 'Room', 'Sync Flow', 'Logs'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    activeTab === tab 
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                      : 'hover:bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {activeTab === 'Discord' && (
              <div className="space-y-4 animate-in slide-in-from-left-2">
                <GridRow label="Status" value={discord.isReady ? 'READY' : 'WAITING'} color={discord.isReady ? 'text-green-400' : 'text-red-400'} />
                <GridRow label="User" value={discord.user?.username || 'null'} />
                <GridRow label="Guild" value={discord.guildId || 'null'} />
                <GridRow label="Channel" value={discord.channelId || 'null'} />
                
                <div className="mt-6">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Voice States ({discord.voiceStates.length})</h4>
                  <div className="space-y-1">
                    {discord.voiceStates.map(vs => (
                      <div key={vs.user.id} className="text-xs p-2 bg-white/5 rounded border border-white/5 flex justify-between items-center">
                        <span className="font-medium">{vs.user.global_name || vs.user.username}</span>
                        <div className="flex gap-2 opacity-50">
                          {vs.voice_state?.self_mute && <span>🔇</span>}
                          {vs.voice_state?.self_deaf && <span>🎧</span>}
                          {discord.speakingUserIds.has(vs.user.id) && <span className="text-green-400 animate-pulse font-bold">SPEAKING</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-[10px] font-bold text-yellow-500/50 uppercase tracking-widest mb-2">Raw Channel Data</h4>
                  <pre className="text-[10px] bg-black/60 p-3 rounded-lg border border-yellow-500/10 overflow-auto max-h-40 whitespace-pre-wrap font-mono text-yellow-200/70">
                    {discord.rawChannelData ? JSON.stringify(discord.rawChannelData, null, 2) : 'No data'}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'Room' && (
              <div className="space-y-4 animate-in slide-in-from-left-2">
                <GridRow label="Connected" value={room.isConnected ? 'YES' : 'NO'} color={room.isConnected ? 'text-green-400' : 'text-red-400'} />
                <GridRow label="My Seat" value={room.mySeatIndex ?? 'None'} />
                <GridRow label="My Furniture" value={room.myFurnitureId || 'None'} />
                <GridRow label="Editing" value={room.isEditing ? 'TRUE' : 'FALSE'} color={room.isEditing ? 'text-amber-400' : 'text-white/40'} />
                
                <div className="mt-6">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Occupants ({room.occupants.size})</h4>
                  <div className="space-y-1">
                    {Array.from(room.occupants.values()).map(o => (
                      <div key={o.user_id} className="text-xs p-2 bg-white/5 rounded border border-white/5 flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-cyan-400">{o.display_name}</span>
                          <span className="text-white/30">#{o.seat_index}</span>
                        </div>
                        <div className="text-[10px] text-white/50 truncate">ID: {o.user_id}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Furnitures ({room.furnitures.length})</h4>
                  <div className="max-h-40 overflow-auto space-y-1">
                    {room.furnitures.map(f => (
                      <div key={f.id} className="text-[10px] p-1.5 bg-white/5 rounded border border-white/5 flex justify-between font-mono">
                        <span className="text-white/70">{f.item_id}</span>
                        <span className="text-white/30">[{f.pos_x}, {f.pos_z}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Sync Flow' && (
              <div className="space-y-3 animate-in slide-in-from-left-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Sync History</h4>
                  <span className="text-[9px] text-white/20 font-mono italic">LATEST AT TOP</span>
                </div>
                <div className="space-y-2">
                  {discord.syncEvents.map((ev) => (
                    <div key={ev.id} className="group flex flex-col gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded bg-black/40 ${getEventColor(ev.type)}`}>
                          {ev.type}
                        </span>
                        <span className="text-[9px] font-mono text-white/30">{formatTime(ev.timestamp)}</span>
                      </div>
                      <div className="text-xs font-bold text-white/90 pl-1">{ev.label}</div>
                      {ev.payload && (
                        <div className="hidden group-hover:block mt-2 animate-in fade-in slide-in-from-top-1">
                          <pre className="text-[9px] bg-black/60 p-2 rounded border border-white/5 font-mono text-cyan-200/50 overflow-auto max-h-32 custom-scrollbar">
                            {JSON.stringify(ev.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                  {discord.syncEvents.length === 0 && <div className="text-center py-10 text-white/20 italic text-xs">No sync events tracked yet.</div>}
                </div>
              </div>
            )}

            {activeTab === 'Logs' && (
              <div className="space-y-2 animate-in slide-in-from-left-2">
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 min-h-[300px] font-mono text-[11px] leading-relaxed custom-scrollbar overflow-auto">
                  {discord.logMessages.map((m, i) => (
                    <div key={i} className="mb-2 border-b border-white/5 pb-1 last:border-0 break-all">
                      <span className="text-cyan-500/50 mr-2">[{discord.logMessages.length - i}]</span>
                      <span className="text-white/80">{m}</span>
                    </div>
                  ))}
                  {discord.logMessages.length === 0 && <div className="text-white/20 italic">Empty logs.</div>}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-2 bg-white/5 border-t border-white/5 flex justify-center">
             <button
                onClick={() => setShowDebug(false)}
                className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest font-black py-1 px-4"
              >
                CLOSE INSPECTOR
              </button>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function GridRow({ label, value, color = 'text-white' }: { label: string; value: any; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
      <span className="text-[11px] font-bold text-white/40 uppercase tracking-tighter">{label}</span>
      <span className={`text-xs font-mono font-bold ${color} truncate max-w-[220px]`}>{String(value)}</span>
    </div>
  );
}
