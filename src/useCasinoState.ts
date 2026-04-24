import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { PlayResult } from './gameLogic';
import { LeaderboardEntry, PlayerProfile, ThemeKey } from './types';

const STORAGE_KEY = 'casino_cartoon_state_v1';
const DAILY_REWARD = 200;
const XP_PER_LEVEL = 100;

const initialProfile: PlayerProfile = {
  coins: 1500,
  level: 1,
  xp: 0,
  streakDays: 0,
  lastClaimedRewardAt: null,
  totalWins: 0,
  gamesPlayed: 0,
  unlockedThemes: ['sunset'],
  selectedTheme: 'sunset',
  avatar: 'Panda Ace',
};

const validThemes: ThemeKey[] = ['sunset', 'mint', 'purple'];
const isThemeKey = (value: string): value is ThemeKey => validThemes.includes(value as ThemeKey);

const sanitizeProfile = (incomingRaw: unknown): PlayerProfile => {
  const incoming =
    incomingRaw && typeof incomingRaw === 'object' ? (incomingRaw as Partial<PlayerProfile>) : {};
  const unlockedThemes = (incoming.unlockedThemes ?? initialProfile.unlockedThemes).filter(isThemeKey);
  const safeUnlocked: ThemeKey[] = unlockedThemes.length > 0 ? unlockedThemes : ['sunset'];
  const selectedTheme: ThemeKey =
    typeof incoming.selectedTheme === 'string' && isThemeKey(incoming.selectedTheme)
      ? incoming.selectedTheme
      : 'sunset';

  return {
    ...initialProfile,
    ...incoming,
    unlockedThemes: safeUnlocked,
    selectedTheme: safeUnlocked.includes(selectedTheme) ? selectedTheme : safeUnlocked[0],
  };
};

const fakeLeaderboard: LeaderboardEntry[] = [
  { id: '1', name: 'Lucky Fox', level: 13, coins: 8430 },
  { id: '2', name: 'Dice Otter', level: 11, coins: 7210 },
  { id: '3', name: 'You', level: 1, coins: 1500 },
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function useCasinoState() {
  const [profile, setProfile] = useState<PlayerProfile>(initialProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
          setProfile(sanitizeProfile(parsed));
        }
      } catch {
        setProfile(initialProfile);
      }
      setLoaded(true);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile, loaded]);

  const canClaimDaily = useMemo(() => {
    if (!profile.lastClaimedRewardAt) {
      return true;
    }
    return !isSameDay(new Date(profile.lastClaimedRewardAt), new Date());
  }, [profile.lastClaimedRewardAt]);

  const applyLevelUp = (base: PlayerProfile): PlayerProfile => {
    let updated = { ...base };
    while (updated.xp >= XP_PER_LEVEL) {
      updated.xp -= XP_PER_LEVEL;
      updated.level += 1;
      if (updated.level === 3 && !updated.unlockedThemes.includes('mint')) {
        updated.unlockedThemes = [...updated.unlockedThemes, 'mint'];
      }
      if (updated.level === 6 && !updated.unlockedThemes.includes('purple')) {
        updated.unlockedThemes = [...updated.unlockedThemes, 'purple'];
      }
    }
    return updated;
  };

  const playResult = (result: PlayResult) => {
    setProfile((prev) => {
      const nextCoins = Math.max(0, prev.coins + result.deltaCoins);
      return applyLevelUp({
        ...prev,
        coins: nextCoins,
        xp: prev.xp + result.xpGained,
        totalWins: prev.totalWins + (result.win ? 1 : 0),
        gamesPlayed: prev.gamesPlayed + 1,
      });
    });
  };

  const claimDailyReward = () => {
    if (!canClaimDaily) {
      return false;
    }
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + DAILY_REWARD + prev.streakDays * 20,
      streakDays: prev.streakDays + 1,
      lastClaimedRewardAt: new Date().toISOString(),
    }));
    return true;
  };

  const tapToEarn = () => {
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + 5,
      xp: prev.xp + 1,
    }));
  };

  const setTheme = (theme: ThemeKey) => {
    if (!profile.unlockedThemes.includes(theme)) {
      return;
    }
    setProfile((prev) => ({ ...prev, selectedTheme: theme }));
  };

  const leaderboard = useMemo(() => {
    const you: LeaderboardEntry = {
      id: '3',
      name: profile.avatar,
      level: profile.level,
      coins: profile.coins,
    };
    return [...fakeLeaderboard.slice(0, 2), you].sort((a, b) => b.coins - a.coins);
  }, [profile.avatar, profile.level, profile.coins]);

  return {
    loaded,
    profile,
    canClaimDaily,
    leaderboard,
    playResult,
    claimDailyReward,
    tapToEarn,
    setTheme,
  };
}
