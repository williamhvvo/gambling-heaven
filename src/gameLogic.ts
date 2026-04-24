import { GameKey } from './types';

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const weightedChoice = <T>(items: Array<{ value: T; weight: number }>) => {
  const total = items.reduce((acc, item) => acc + item.weight, 0);
  const pick = Math.random() * total;
  let running = 0;
  for (const item of items) {
    running += item.weight;
    if (pick <= running) {
      return item.value;
    }
  }
  return items[items.length - 1].value;
};

export interface PlayResult {
  title: string;
  detail: string;
  deltaCoins: number;
  xpGained: number;
  win: boolean;
  game: GameKey;
}

export const runBlackjackRound = (bet: number): PlayResult => {
  const player = randomInt(14, 22);
  const dealer = randomInt(14, 22);

  if (player > 21) {
    return {
      title: 'Bust!',
      detail: `You drew ${player}. Dealer stays at ${dealer}.`,
      deltaCoins: -bet,
      xpGained: 10,
      win: false,
      game: 'blackjack',
    };
  }

  if (dealer > 21 || player > dealer) {
    return {
      title: 'Blackjack Win!',
      detail: `You ${player} vs Dealer ${dealer}.`,
      deltaCoins: Math.floor(bet * 1.6),
      xpGained: 24,
      win: true,
      game: 'blackjack',
    };
  }

  if (player === dealer) {
    return {
      title: 'Push',
      detail: `Both landed on ${player}.`,
      deltaCoins: 0,
      xpGained: 14,
      win: false,
      game: 'blackjack',
    };
  }

  return {
    title: 'Dealer Wins',
    detail: `Dealer ${dealer} beats your ${player}.`,
    deltaCoins: -bet,
    xpGained: 10,
    win: false,
    game: 'blackjack',
  };
};

export const runRouletteRound = (bet: number): PlayResult => {
  const landed = randomInt(0, 36);
  const prediction = weightedChoice([
    { value: 'red', weight: 45 },
    { value: 'black', weight: 45 },
    { value: 'green', weight: 10 },
  ]);

  const isGreen = landed === 0;
  const actual = isGreen ? 'green' : landed % 2 === 0 ? 'black' : 'red';
  const win = actual === prediction;
  const multiplier = prediction === 'green' ? 10 : 2;

  return {
    title: win ? 'Roulette Hit!' : 'No Luck',
    detail: `You picked ${prediction}. Ball landed on ${landed} (${actual}).`,
    deltaCoins: win ? Math.floor(bet * multiplier) : -bet,
    xpGained: win ? 22 : 9,
    win,
    game: 'roulette',
  };
};

export const runCrapsRound = (bet: number): PlayResult => {
  const dieOne = randomInt(1, 6);
  const dieTwo = randomInt(1, 6);
  const total = dieOne + dieTwo;

  const win = [7, 11].includes(total) || (total % 2 === 0 && total >= 8);

  return {
    title: win ? 'Craps Win!' : 'Craps Miss',
    detail: `Rolled ${dieOne} + ${dieTwo} = ${total}.`,
    deltaCoins: win ? Math.floor(bet * 1.8) : -bet,
    xpGained: win ? 20 : 8,
    win,
    game: 'craps',
  };
};

export const runSlotsRound = (bet: number): PlayResult => {
  const symbols = ['cherry', 'star', 'bar', 'seven'];
  const spin = Array.from({ length: 3 }, () => symbols[randomInt(0, symbols.length - 1)]);
  const unique = new Set(spin).size;

  let multiplier = 0;
  if (unique === 1) {
    multiplier = spin[0] === 'seven' ? 8 : 4;
  } else if (unique === 2) {
    multiplier = 1.5;
  }

  const win = multiplier > 0;
  const payout = Math.floor(bet * multiplier);

  return {
    title: win ? 'Jackpot-ish!' : 'Whiff',
    detail: `Spin: ${spin.join(' | ')}`,
    deltaCoins: win ? payout : -bet,
    xpGained: win ? 26 : 7,
    win,
    game: 'slots',
  };
};
