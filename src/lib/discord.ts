import { DiscordSDK } from '@discord/embedded-app-sdk';

const discordClientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '';

// クライアント側で一意のインスタンスを作成します
export const discordSdk = new DiscordSDK(discordClientId);
