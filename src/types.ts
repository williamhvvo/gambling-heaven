export type GameKey = 'blackjack' | 'roulette' | 'craps' | 'slots';

export type ThemeKey = 'sunset' | 'mint' | 'purple';

export interface PlayerProfile {
  coins: number;
  level: number;
  xp: number;
  streakDays: number;
  lastClaimedRewardAt: string | null;
  totalWins: number;
  gamesPlayed: number;
  unlockedThemes: ThemeKey[];
  selectedTheme: ThemeKey;
  avatar: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  coins: number;
}
