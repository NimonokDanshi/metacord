'use client';

import Image from 'next/image';
import { useDiscordUser } from '@/hooks/useDiscordUser';

export default function UserProfile() {
  const { user, avatarUrl, displayName } = useDiscordUser();

  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt={displayName ?? 'User Avatar'}
          width={80}
          height={80}
          className="rounded-full border-4 border-blue-500/50 shadow-lg"
          unoptimized
        />
      )}
      <div>
        <p className="text-xl font-bold text-white">{displayName}</p>
        <p className="text-sm text-slate-400">@{user.username}</p>
      </div>
      <div className="mt-2 bg-slate-700/60 rounded-lg px-4 py-2 text-xs text-slate-400 font-mono">
        ID: {user.id}
      </div>
      <p className="text-green-400 text-sm font-medium">✅ Discord認証 完了</p>
    </div>
  );
}
