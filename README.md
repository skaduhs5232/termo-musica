# 🎵 Termo Musical

Um jogo inspirado no **Termo** (versão brasileira do Wordle) para adivinhar artistas musicais! Ouça um preview de 2 segundos de uma música e tente descobrir o artista em até 6 tentativas.

## ✨ Funcionalidades

- 🎧 **Preview de Áudio**: Ouça 2 segundos de uma música do artista
- 🎯 **Sistema de Tentativas**: Até 6 tentativas para acertar
- 🎨 **Feedback Visual**: Cores indicam se as letras estão corretas, presentes ou ausentes
- 📅 **Desafio Diário**: Um novo artista todos os dias
- 🎲 **Modo Prática**: Jogue com artistas aleatórios quantas vezes quiser
- 🎵 **Modo Música**: Digite um artista e tente adivinhar o nome da música
- 🎧 **Integração Spotify**: Conecte sua conta do Spotify para jogos personalizados com seus artistas favoritos
- 💡 **Sistema de Dicas**: Dicas adicionais sobre o artista
- 📱 **Responsivo**: Funciona perfeitamente em desktop e mobile
- 📊 **Compartilhamento**: Compartilhe seus resultados nas redes sociais

## 🎧 Integração com Spotify

A integração com Spotify permite que você:
- 🎯 Jogue com artistas baseados no seu histórico de escuta
- 📊 Use seus top artistas para desafios personalizados
- 🔄 Acesse artistas das suas músicas tocadas recentemente
- 🎪 Tenha uma experiência de jogo mais personalizada

### Como configurar o Spotify:

1. Acesse o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Crie uma nova aplicação
3. Configure a URL de redirecionamento: `https://termo-musica.vercel.app/` (para produção) ou `http://localhost:3000/` (para desenvolvimento)
4. Anote o `Client ID` e `Client Secret`

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Lucide React** - Ícones
- **Web Audio API** - Reprodução de áudio

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js 18+ 
- npm, yarn, pnpm ou bun

### Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd termo-musica
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Importante**: Configure a integração com Spotify (opcional)

   - Copie o arquivo `.env.example` para `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Acesse o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
   - Crie um novo aplicativo
   - Adicione `https://termo-musica.vercel.app/` como URI de redirecionamento (e `http://localhost:3000/` para desenvolvimento local)
   - Copie o Client ID e Client Secret para o arquivo `.env.local`

4. **Importante**: Adicione os arquivos de áudio

   - Vá para a pasta `public/audio`
   - Adicione os arquivos MP3 de preview (2 segundos cada)
   - Consulte `public/audio/README.md` para a lista completa

5. Execute o projeto:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

6. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🎵 Adicionando Novos Artistas

1. Edite o arquivo `src/data/artists.ts`
2. Adicione o novo artista seguindo a interface:

```typescript
{
  id: 'unique-id',
  name: 'NOME_DO_ARTISTA',
  audioPreview: '/audio/artista-preview.mp3',
  hints: ['Dica 1', 'Dica 2']
}
```

3. Adicione o arquivo de áudio correspondente em `public/audio/`

## 📁 Estrutura do Projeto

```
src/
├── app/              # Pages (Next.js App Router)
├── components/       # Componentes React reutilizáveis
├── data/            # Base de dados de artistas
├── lib/             # Lógica do jogo e utilitários
└── types/           # Definições TypeScript

public/
├── audio/           # Arquivos de preview de áudio
└── ...
```

## 🎯 Como Jogar

### 🎤 Modo Artista
1. **Ouça o Preview**: Clique no botão play para ouvir 2 segundos da música
2. **Digite sua Tentativa**: Insira o nome do artista (apenas letras e espaços)
3. **Observe o Feedback**: 
   - 🟩 Verde: Letra correta na posição certa
   - 🟨 Amarelo: Letra existe, mas posição errada  
   - ⬜ Cinza: Letra não existe no nome
4. **Use as Dicas**: Clique em "Mostrar Dica" se precisar de ajuda
5. **Compartilhe**: Compartilhe seu resultado ao terminar!

### 🎧 Integração Spotify
- **Conecte sua conta**: Use o botão "Conectar com Spotify" para personalizar sua experiência
- **Desafios Personalizados**: Com o Spotify conectado, os desafios diários e modo prática usarão artistas do seu histórico de escuta
- **Fallback Automático**: Se não conectar ou houver erro, o jogo funciona normalmente com a base de artistas padrão

## 🏗️ Build para Produção

```bash
npm run build
npm start
```

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o ESLint

## ⚖️ Licença e Direitos Autorais

Este projeto é um clone educacional do Termo. 

**Importante**: Os arquivos de áudio não estão incluídos. Você deve:
- Obter os arquivos de áudio legalmente
- Garantir que possui os direitos de uso
- Respeitar os direitos autorais dos artistas

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

