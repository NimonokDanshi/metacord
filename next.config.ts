import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// wss:// 形式に変換（https:// → wss://、http:// → ws://）
const supabaseWs = supabaseUrl
  .replace(/^https:\/\//, 'wss://')
  .replace(/^http:\/\//, 'ws://');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // スクリプト: Next.js / PixiJS / Discord SDK
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // スタイル
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // フォント
              "font-src 'self' https://fonts.gstatic.com",
              // 画像: Discord CDN（アバター等）
              "img-src 'self' data: blob: https://cdn.discordapp.com",
              // WebSocket / REST 接続先
              `connect-src 'self' ${supabaseUrl} ${supabaseWs} https://discord.com wss://gateway.discord.gg`,
              // iFrame（Discord Activity は Discord のフレーム内で動く）
              "frame-ancestors https://discord.com https://*.discord.com",
              // メディア
              "media-src 'none'",
              // オブジェクト
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
