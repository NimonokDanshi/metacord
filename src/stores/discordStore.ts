import { create } from 'zustand';
import { DiscordUser, VoiceState } from '@/types/discord';
import { AvatarType } from '@/types/room';

interface DiscordStore {
  user: DiscordUser | null;
  instanceId: string | null;
  channelId: string | null;
  guildId: string | null;
  voiceStates: VoiceState[];
  avatarType: AvatarType;
  isReady: boolean;
  rawChannelData: any;
  logMessages: string[];
  setUser: (user: DiscordUser | null) => void;
  setReady: (ready: boolean) => void;
  setInfo: (info: { instanceId: string; channelId: string | null; guildId: string | null }) => void;
  setAvatarType: (type: AvatarType) => void;
  setVoiceStates: (states: VoiceState[]) => void;
  updateVoiceState: (state: VoiceState) => void;
  removeVoiceState: (userId: string) => void;
  setRawChannelData: (data: any) => void;
  addLogMessage: (msg: string) => void;
}

export const useDiscordStore = create<DiscordStore>((set) => ({
  user: null,
  instanceId: null,
  channelId: null,
  guildId: null,
  voiceStates: [],
  avatarType: 'default',
  isReady: false,
  rawChannelData: null,
  logMessages: [],
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ isReady: ready }),
  setInfo: (info) => set({ ...info }),
  setAvatarType: (avatarType) => set({ avatarType }),
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
}));
