# Coin Carnival Casino (Virtual Currency Only)

A cross-platform Expo React Native mobile game app that simulates a fun cartoon casino experience with **no real-money gambling**.

## Included Mini Games

- Blackjack
- Roulette
- Craps
- Slot machine

## Core Systems Implemented

- Virtual coin economy only (no cash-in, no betting with real money)
- Daily reward with streak bonus
- Tap-to-earn loop (`+5` coins per tap)
- XP and levels
- Theme progression unlocks by level
- Tutorial text for each game
- In-app leaderboard (local + sample rivals)
- Beginner-friendly fast rounds and replayable loops

## Tech Stack

- Expo + React Native + TypeScript
- `@react-native-async-storage/async-storage` for local persistence
- Backend-ready repository interface (`src/backend.ts`) for API/Firebase/Supabase integration

## Run

```bash
npm install
npm run ios
# or
npm run android
```

## Project Structure

- `App.tsx` - main UI, game flow, progression screens, and interactions
- `src/gameLogic.ts` - mini-game simulation logic
- `src/useCasinoState.ts` - persistent coins/progression/reward state
- `src/backend.ts` - backend persistence abstraction
- `src/types.ts` - shared domain types

## Product Safety Notes

- Explicit in-app message states the game uses virtual coins only
- Rewards are casual and non-punitive
- No pay-to-win or predatory monetization included

## Next Enhancements

- Avatar customization screen with unlockable cosmetics
- Missions and daily challenge panel
- Spin-the-wheel bonus event
- Real online leaderboard service
