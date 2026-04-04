import { create } from 'zustand';
import { DiscordUser } from '@/types/discord';

interface DiscordStore {
  user: DiscordUser | null;
  isReady: boolean;
  setUser: (user: DiscordUser) => void;
  setReady: (ready: boolean) => void;
}

export const useDiscordStore = create<DiscordStore>((set) => ({
  user: null,
  isReady: false,
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ isReady: ready }),
}));
