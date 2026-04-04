import { NextRequest, NextResponse } from 'next/server';

/**
 * Discord OAuthのcodeをアクセストークンに交換するAPIルート
 * client_secret はサーバーサイドのみで使用し、クライアントに公開しない
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Discord環境変数が設定されていません' },
        { status: 500 }
      );
    }

    // DiscordのOAuth2トークンエンドポイントにリクエスト
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Discord token exchange error:', errorData);
      return NextResponse.json(
        { error: 'トークン取得に失敗しました' },
        { status: tokenResponse.status }
      );
    }

    const data = await tokenResponse.json();

    return NextResponse.json({ access_token: data.access_token });
  } catch (error) {
    console.error('Token API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
