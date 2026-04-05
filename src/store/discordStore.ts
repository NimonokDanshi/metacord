import { create } from 'zustand';
import { DiscordUser } from '@/types/discord';

interface DiscordStore {
  user: DiscordUser | null;
  instanceId: string | null;
  channelId: string | null;
  guildId: string | null;
  isReady: boolean;
  setUser: (user: DiscordUser) => void;
  setReady: (ready: boolean) => void;
  setInfo: (info: { instanceId: string; channelId: string | null; guildId: string | null }) => void;
}

export const useDiscordStore = create<DiscordStore>((set) => ({
  user: null,
  instanceId: null,
  channelId: null,
  guildId: null,
  isReady: false,
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ isReady: ready }),
  setInfo: (info) => set({ ...info }),
}));
