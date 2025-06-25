import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  
  return NextResponse.json({
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasRedirectUri: !!redirectUri,
    clientIdLength: clientId?.length || 0,
    clientSecretLength: clientSecret?.length || 0,
    redirectUri: redirectUri || 'not set',
    environment: process.env.NODE_ENV || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || 'not vercel',
    timestamp: new Date().toISOString()
  });
}
