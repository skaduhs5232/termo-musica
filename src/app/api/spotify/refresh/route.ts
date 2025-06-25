import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    console.log('Refresh token request received:', { 
      hasRefreshToken: !!refresh_token,
      timestamp: new Date().toISOString()
    });

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Token de atualização é obrigatório' },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    console.log('Environment check for refresh:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });

    if (!clientId || !clientSecret) {
      console.error('Missing Spotify credentials for refresh');
      return NextResponse.json(
        { error: 'Credenciais do Spotify não configuradas no servidor' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    });

    console.log('Making refresh request to Spotify API...');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: params.toString(),
    });

    console.log('Spotify refresh API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify refresh API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          error: 'Falha ao renovar token do Spotify',
          details: errorData.error_description || errorData.error || 'Erro desconhecido',
          status: response.status
        },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    console.log('Refresh token obtained successfully');
    
    return NextResponse.json(tokenData);

  } catch (error) {
    console.error('Error in refresh endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
