import { create } from 'zustand';
import { DiscordUser, VoiceState } from '@/types/discord';
import { AvatarType } from '@/types/room';
import { MySet, DEFAULT_MYSET } from '@/utils/userMetadataUtil';
 
export type SyncEventType = 'DB_REQ' | 'DB_RES' | 'REALTIME' | 'PRESENCE' | 'ERROR';
 
export interface SyncEvent {
  id: string;
  type: SyncEventType;
  label: string;
  payload?: any;
  timestamp: number;
}

interface DiscordStore {
  user: DiscordUser | null;
  instanceId: string | null;
  channelId: string | null;
  guildId: string | null;
  voiceStates: VoiceState[];
  avatarType: AvatarType;
  mySet: MySet;
  isReady: boolean;
  rawChannelData: any;
  logMessages: string[];
  speakingUserIds: Set<string>;
  setUser: (user: DiscordUser | null) => void;
  setReady: (ready: boolean) => void;
  setInfo: (info: { instanceId: string; channelId: string | null; guildId: string | null }) => void;
  setAvatarType: (type: AvatarType) => void;
  setMySet: (mySet: MySet) => void;
  setVoiceStates: (states: VoiceState[]) => void;
  updateVoiceState: (state: VoiceState) => void;
  removeVoiceState: (userId: string) => void;
  setRawChannelData: (data: any) => void;
  addLogMessage: (msg: string) => void;
  setSpeaking: (userId: string, isSpeaking: boolean) => void;
  syncEvents: SyncEvent[];
  addSyncEvent: (event: Omit<SyncEvent, 'id' | 'timestamp'>) => void;
  clearSyncEvents: () => void;
}

export const useDiscordStore = create<DiscordStore>((set) => ({
  user: null,
  instanceId: null,
  channelId: null,
  guildId: null,
  voiceStates: [],
  avatarType: 'default',
  mySet: DEFAULT_MYSET,
  isReady: false,
  rawChannelData: null,
  logMessages: [],
  speakingUserIds: new Set(),
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ isReady: ready }),
  setInfo: (info) => set({ ...info }),
  setAvatarType: (avatarType) => set({ avatarType }),
  setMySet: (mySet) => set({ mySet }),
  setVoiceStates: (voiceStates) => set({ voiceStates }),
  updateVoiceState: (newState) => set((state) => {
    const exists = state.voiceStates.find((s) => s.user.id === newState.user.id);
    if (!exists) {
      return { voiceStates: [...state.voiceStates, newState] };
    }
    return {
      voiceStates: state.voiceStates.map((s) =>
        s.user.id === newState.user.id ? newState : s
      ),
    };
  }),
  removeVoiceState: (userId) => set((state) => ({
    voiceStates: state.voiceStates.filter((s) => s.user.id !== userId)
  })),
  setRawChannelData: (rawChannelData) => set({ rawChannelData }),
  addLogMessage: (msg) => set((state) => ({
    logMessages: [msg, ...state.logMessages].slice(0, 20)
  })),
  setSpeaking: (userId, isSpeaking) => set((state) => {
    const next = new Set(state.speakingUserIds);
    if (isSpeaking) {
      next.add(userId);
    } else {
      next.delete(userId);
    }
    return { speakingUserIds: next };
  }),
  syncEvents: [],
  addSyncEvent: (event) => set((state) => ({
    syncEvents: [
      {
        ...event,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
      },
      ...state.syncEvents,
    ].slice(0, 50),
  })),
  clearSyncEvents: () => set({ syncEvents: [] }),
}));
