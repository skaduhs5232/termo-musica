import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, redirect_uri } = await request.json();

    console.log('Token request received:', { 
      hasCode: !!code, 
      redirect_uri,
      timestamp: new Date().toISOString()
    });

    if (!code || !redirect_uri) {
      console.error('Missing required parameters:', { code: !!code, redirect_uri: !!redirect_uri });
      return NextResponse.json(
        { error: 'Código e URI de redirecionamento são obrigatórios' },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    console.log('Environment check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0,
      clientSecretLength: clientSecret?.length || 0
    });

    if (!clientId || !clientSecret) {
      console.error('Missing Spotify credentials');
      return NextResponse.json(
        { error: 'Credenciais do Spotify não configuradas no servidor' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
    });

    console.log('Making request to Spotify API...');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: params.toString(),
    });

    console.log('Spotify API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          error: 'Falha ao obter token do Spotify',
          details: errorData.error_description || errorData.error || 'Erro desconhecido',
          status: response.status
        },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    console.log('Token obtained successfully');
    
    return NextResponse.json(tokenData);

  } catch (error) {
    console.error('Error in token endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
