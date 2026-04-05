'use client';

import { useDiscordStore } from '@/store/discordStore';
import { DiscordUser, getDiscordAvatarUrl } from '@/types/discord';

/**
 * Zustandに保存されたDiscordユーザー情報と便利なユーティリティを返すカスタムフック
 */
export function useDiscordUser(): {
  user: DiscordUser | null;
  isReady: boolean;
  avatarUrl: string | null;
  displayName: string | null;
} {
  const { user, isReady } = useDiscordStore();

  return {
    user,
    isReady,
    avatarUrl: user ? getDiscordAvatarUrl(user) : null,
    displayName: user?.global_name ?? user?.username ?? null,
  };
}
