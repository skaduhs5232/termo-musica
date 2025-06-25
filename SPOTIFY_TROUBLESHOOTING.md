# 🚨 Guia de Resolução - Erro Spotify

## ❌ Erro Atual: "INVALID_CLIENT: Invalid redirect URI"

### 🔧 Solução Rápida:

#### 1. **Spotify Developer Dashboard**
1. Acesse: https://developer.spotify.com/dashboard/applications
2. Clique na sua app "Termo Musical"
3. Clique em **"Edit Settings"**
4. Na seção **"Redirect URIs"**, certifique-se de que está **exatamente**:
   ```
   https://termo-musica.vercel.app/
   ```
   ⚠️ **IMPORTANTE**: Deve terminar com `/` (barra)

#### 2. **Vercel Environment Variables**
1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Verifique/atualize a variável:
   ```
   Nome: NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
   Valor: https://termo-musica.vercel.app/
   Environment: Production, Preview, Development
   ```

#### 3. **Redeploy da Aplicação**
1. Vá na aba **"Deployments"**
2. Clique nos três pontos do último deploy
3. Clique em **"Redeploy"**

### 🔍 Verificação:

1. **Teste o endpoint debug**: https://termo-musica.vercel.app/api/spotify/debug
   
   Deve retornar:
   ```json
   {
     "hasClientId": true,
     "hasClientSecret": true,
     "hasRedirectUri": true,
     "redirectUri": "https://termo-musica.vercel.app/"
   }
   ```

2. **Teste o botão Spotify** no canto superior direito da aplicação

### 📋 Checklist de Verificação:

- [ ] URL no Spotify Dashboard: `https://termo-musica.vercel.app/`
- [ ] Variável no Vercel: `https://termo-musica.vercel.app/`
- [ ] Fez redeploy após alterar variáveis
- [ ] Endpoint debug retorna valores corretos
- [ ] Botão Spotify funciona sem erro

### 🔄 URLs Alternativas:

Se `termo-musica.vercel.app` não for a URL correta, use a URL real da sua aplicação:
- Pode ser `termo-musica-v9jb.vercel.app`
- Pode ser `termo-musica-seu-usuario.vercel.app`
- Verifique no dashboard do Vercel qual é a URL real

### 💡 Dica:

Para ter certeza da URL correta, acesse o dashboard do Vercel e copie a URL exata do seu projeto. Use essa URL **exatamente como aparece** no Spotify Developer Dashboard.

### 🆘 Se ainda não funcionar:

1. Verifique os logs do Vercel em **"Functions"** → **"View Function Logs"**
2. Tente acessar: `sua-url.vercel.app/api/spotify/debug`
3. Abra as ferramentas de desenvolvedor (F12) e veja o console para erros

---

**✅ Após seguir todos os passos, o botão Spotify deve funcionar perfeitamente!**
