import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PlayResult,
  runBlackjackRound,
  runCrapsRound,
  runRouletteRound,
  runSlotsRound,
} from './src/gameLogic';
import { GameKey, ThemeKey } from './src/types';
import { useCasinoState } from './src/useCasinoState';

const gameCards: Array<{ key: GameKey; label: string; blurb: string; tutorial: string }> = [
  {
    key: 'blackjack',
    label: 'Blackjack',
    blurb: 'Beat dealer total without busting.',
    tutorial: 'Try to end closer to 21 than the dealer. Over 21 busts immediately.',
  },
  {
    key: 'roulette',
    label: 'Roulette',
    blurb: 'Pick a color and spin.',
    tutorial: 'Red/black are safer; green is rare but high reward.',
  },
  {
    key: 'craps',
    label: 'Craps',
    blurb: 'Fast dice showdown.',
    tutorial: 'Natural 7 or 11 wins. High even rolls can also score.',
  },
  {
    key: 'slots',
    label: 'Slots',
    blurb: 'Match symbols for coin bursts.',
    tutorial: 'Three matching symbols pay big. Two matching symbols still reward.',
  },
];

const palettes: Record<ThemeKey, [string, string]> = {
  sunset: ['#ff9f68', '#ff5f9e'],
  mint: ['#4ed8c0', '#3096ff'],
  purple: ['#8e6bff', '#da53ff'],
};

const fallbackPalette: [string, string] = palettes.sunset;

export default function App() {
  const { loaded, profile, canClaimDaily, leaderboard, playResult, claimDailyReward, tapToEarn, setTheme } =
    useCasinoState();

  const [selectedGame, setSelectedGame] = useState<GameKey>('blackjack');
  const [bet, setBet] = useState(100);
  const [lastResult, setLastResult] = useState<PlayResult | null>(null);
  const activePalette = palettes[profile.selectedTheme] ?? fallbackPalette;

  const play = () => {
    if (bet > profile.coins) {
      Alert.alert('Not enough coins', 'Use Tap +5 or claim daily reward first.');
      return;
    }

    const result =
      selectedGame === 'blackjack'
        ? runBlackjackRound(bet)
        : selectedGame === 'roulette'
          ? runRouletteRound(bet)
          : selectedGame === 'craps'
            ? runCrapsRound(bet)
            : runSlotsRound(bet);

    playResult(result);
    setLastResult(result);
  };

  const selectedTutorial = useMemo(
    () => gameCards.find((game) => game.key === selectedGame)?.tutorial ?? '',
    [selectedGame]
  );

  if (!loaded) {
    return (
      <SafeAreaView style={styles.loader}>
        <Text style={styles.loaderText}>Loading your cartoon casino...</Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={activePalette} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.header}>Coin Carnival Casino</Text>
          <Text style={styles.subheader}>Virtual coins only - no real-money gambling.</Text>

          <View style={styles.statsRow}>
            <Stat label="Coins" value={profile.coins.toString()} />
            <Stat label="Level" value={profile.level.toString()} />
            <Stat label="XP" value={`${profile.xp}/100`} />
          </View>

          <View style={styles.rewardRow}>
            <ActionButton
              label={canClaimDaily ? `Claim Daily +${200 + profile.streakDays * 20}` : 'Daily Claimed'}
              onPress={() => {
                if (claimDailyReward()) {
                  Alert.alert('Reward Collected', 'Daily coins added to your stash.');
                }
              }}
              disabled={!canClaimDaily}
            />
            <ActionButton label="Tap +5" onPress={tapToEarn} />
          </View>

          <Text style={styles.sectionTitle}>Choose A Game</Text>
          <View style={styles.gameGrid}>
            {gameCards.map((game) => (
              <Pressable
                key={game.key}
                onPress={() => setSelectedGame(game.key)}
                style={[styles.gameCard, selectedGame === game.key && styles.gameCardActive]}
              >
                <Text style={styles.gameTitle}>{game.label}</Text>
                <Text style={styles.gameBlurb}>{game.blurb}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialLabel}>Tutorial</Text>
            <Text style={styles.tutorialText}>{selectedTutorial}</Text>
          </View>

          <View style={styles.betRow}>
            {[50, 100, 250].map((amount) => (
              <ActionButton
                key={amount}
                label={`Bet ${amount}`}
                onPress={() => setBet(amount)}
                highlighted={bet === amount}
              />
            ))}
          </View>

          <ActionButton label={`Play ${selectedGame}`} onPress={play} large />

          {lastResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{lastResult.title}</Text>
              <Text style={styles.resultText}>{lastResult.detail}</Text>
              <Text style={styles.resultDelta}>
                {lastResult.deltaCoins >= 0 ? '+' : ''}
                {lastResult.deltaCoins} coins
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Themes & Unlocks</Text>
          <View style={styles.themeRow}>
            {(['sunset', 'mint', 'purple'] as ThemeKey[]).map((theme) => {
              const unlocked = profile.unlockedThemes.includes(theme);
              return (
                <ActionButton
                  key={theme}
                  label={unlocked ? theme : `${theme} (lvl locked)`}
                  onPress={() => setTheme(theme)}
                  disabled={!unlocked}
                  highlighted={profile.selectedTheme === theme}
                />
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
          <View style={styles.board}>
            {leaderboard.map((entry, index) => (
              <View key={entry.id} style={styles.boardRow}>
                <Text style={styles.boardText}>
                  #{index + 1} {entry.name}
                </Text>
                <Text style={styles.boardText}>
                  L{entry.level} - {entry.coins}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <StatusBar style="light" />
      </SafeAreaView>
    </LinearGradient>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
  highlighted,
  large,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  highlighted?: boolean;
  large?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        highlighted && styles.buttonHighlighted,
        large && styles.buttonLarge,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  header: { color: '#fff', fontSize: 30, fontWeight: '800' },
  subheader: { color: '#f7f4ff', fontSize: 14, marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    padding: 10,
    flex: 1,
  },
  statLabel: { color: '#efe7ff', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '700' },
  rewardRow: { flexDirection: 'row', gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8 },
  gameGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gameCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gameCardActive: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.24)' },
  gameTitle: { color: '#fff', fontWeight: '700' },
  gameBlurb: { color: '#f3eafe', fontSize: 12, marginTop: 4 },
  tutorialCard: {
    backgroundColor: 'rgba(18,13,31,0.28)',
    borderRadius: 12,
    padding: 12,
  },
  tutorialLabel: { color: '#ffeab8', fontSize: 12, fontWeight: '700' },
  tutorialText: { color: '#fff', marginTop: 4, fontSize: 13 },
  betRow: { flexDirection: 'row', gap: 8 },
  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonLarge: { paddingVertical: 14 },
  buttonHighlighted: { backgroundColor: 'rgba(255,255,255,0.34)' },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 13, textTransform: 'capitalize' },
  resultCard: { backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 12, padding: 12 },
  resultTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  resultText: { color: '#efe9ff', marginTop: 4 },
  resultDelta: { color: '#fff3bc', marginTop: 8, fontWeight: '700' },
  themeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  board: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, gap: 8 },
  boardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  boardText: { color: '#fff', fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3f267a' },
  loaderText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
