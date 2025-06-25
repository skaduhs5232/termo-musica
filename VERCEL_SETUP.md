# 🚀 Configuração do Vercel para Integração Spotify

## 📋 Pré-requisitos

1. Conta no [Spotify for Developers](https://developer.spotify.com/dashboard/applications)
2. Projeto já deployado no Vercel
3. As credenciais do Spotify (Client ID e Client Secret)

## 🔧 Passo a Passo

### 1. Configurar App no Spotify

1. Acesse: https://developer.spotify.com/dashboard/applications
2. Clique em "Create App"
3. Preencha os dados:
   - **App name**: Termo Musical
   - **App description**: Jogo musical inspirado no Termo
   - **Website**: https://sua-app.vercel.app
   - **Redirect URIs**: https://sua-app.vercel.app/
4. Marque as opções necessárias e clique em "Save"
5. Anote o **Client ID** e **Client Secret**

### 2. Configurar Variáveis no Vercel

#### Opção A: Via Dashboard do Vercel
1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique na aba **"Settings"**
3. Clique em **"Environment Variables"**
4. Adicione as seguintes variáveis:

```
Nome: NEXT_PUBLIC_SPOTIFY_CLIENT_ID
Valor: seu_client_id_aqui
Environment: Production, Preview, Development

Nome: SPOTIFY_CLIENT_SECRET
Valor: seu_client_secret_aqui
Environment: Production, Preview, Development

Nome: NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
Valor: https://sua-app.vercel.app/
Environment: Production, Preview, Development
```

#### Opção B: Via CLI do Vercel
```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login no Vercel
vercel login

# Configurar variáveis
vercel env add NEXT_PUBLIC_SPOTIFY_CLIENT_ID
# Cole seu Client ID quando solicitado

vercel env add SPOTIFY_CLIENT_SECRET
# Cole seu Client Secret quando solicitado

vercel env add NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
# Cole sua URL do Vercel quando solicitado
```

### 3. Redeploy da Aplicação

Após configurar as variáveis de ambiente, você precisa fazer um novo deploy:

#### Via Dashboard:
1. Vá na aba **"Deployments"**
2. Clique nos três pontos do último deploy
3. Clique em **"Redeploy"**

#### Via CLI:
```bash
vercel --prod
```

#### Via Git:
- Faça um novo commit e push para o repositório
- O Vercel fará o deploy automaticamente

### 4. Verificar Configuração

1. Acesse sua aplicação no Vercel
2. Teste o botão do Spotify no canto superior direito
3. Se houver erro, verifique os logs do Vercel

## 🔍 Troubleshooting

### Erro: "Credenciais do Spotify não configuradas"

1. Verifique se as variáveis estão configuradas no Vercel
2. Certifique-se de que fez o redeploy após configurar
3. Verifique se os nomes das variáveis estão corretos (case-sensitive)

### Erro: "Invalid redirect URI"

1. Verifique se a URL de redirect no Spotify Developer Dashboard está correta
2. Certifique-se de que termina com `/` (barra)
3. Deve ser exatamente igual à URL da sua aplicação

### Como verificar se as variáveis estão funcionando

Acesse: `https://sua-app.vercel.app/api/spotify/debug`

Deve retornar algo como:
```json
{
  "hasClientId": true,
  "hasClientSecret": true,
  "hasRedirectUri": true,
  "clientIdLength": 32,
  "redirectUri": "https://sua-app.vercel.app/"
}
```

## 📝 Exemplo de Configuração

Para o projeto `termo-musica-v9jb.vercel.app`:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=553a18acad8b409eb86e943c21a1053f
SPOTIFY_CLIENT_SECRET=aff595c82592472f8028efccc292ecfd
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://termo-musica-v9jb.vercel.app/
```

## ⚠️ Importante

- **NUNCA** commite arquivos `.env.local` ou `.env` com credenciais reais
- Use sempre o dashboard do Vercel ou CLI para configurar variáveis sensíveis
- As variáveis `NEXT_PUBLIC_*` são expostas no cliente, mas são necessárias para OAuth
- O `CLIENT_SECRET` fica apenas no servidor e não é exposto
