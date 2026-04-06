import { create } from 'zustand';
import { DiscordUser, VoiceState } from '@/types/discord';

interface DiscordStore {
  user: DiscordUser | null;
  instanceId: string | null;
  channelId: string | null;
  guildId: string | null;
  voiceStates: VoiceState[];
  isReady: boolean;
  setUser: (user: DiscordUser) => void;
  setReady: (ready: boolean) => void;
  setInfo: (info: { instanceId: string; channelId: string | null; guildId: string | null }) => void;
  setVoiceStates: (states: VoiceState[]) => void;
  updateVoiceState: (state: VoiceState) => void;
}

export const useDiscordStore = create<DiscordStore>((set) => ({
  user: null,
  instanceId: null,
  channelId: null,
  guildId: null,
  voiceStates: [],
  isReady: false,
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ isReady: ready }),
  setInfo: (info) => set({ ...info }),
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
}));
