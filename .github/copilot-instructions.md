# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a **Termo Musical** project - a Wordle-like game for guessing musical artists. Players have 6 attempts to guess the correct artist name, with a 2-second audio preview as a hint.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API
- **State Management**: React hooks

## Key Features

1. **Game Mechanics**: Similar to Wordle/Termo with 6 attempts
2. **Audio Preview**: 2-second music clips as hints
3. **Visual Feedback**: Color-coded letter feedback (correct position, wrong position, not in word)
4. **Artist Database**: Collection of popular artists with their music previews
5. **Daily Challenge**: One artist per day
6. **Share Results**: Social media sharing functionality

## Code Guidelines

- Use functional components with TypeScript
- Implement responsive design with Tailwind CSS
- Handle audio playback efficiently
- Use proper error handling for audio loading
- Implement accessibility features
- Follow Next.js best practices for performance
- Use semantic HTML and proper ARIA labels

## File Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and game logic
- `/src/data` - Artist database and game data
- `/src/types` - TypeScript type definitions
- `/public/audio` - Audio preview files
