
export type PlayerStatus = 'green' | 'orange' | 'red' | 'eliminated';

export type Player = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
  isEliminated: boolean;
  status?: PlayerStatus;
  coins: number;
  isBot?: boolean;
  isAnonymous?: boolean;
  
  // Additional properties for authenticated users
  email?: string;
  totalScore?: number;
  gamesPlayed?: number;
  gamesWon?: number;
  
  // Gamification properties
  level?: number;
  experience?: number;
  badges?: Badge[];
  achievements?: Achievement[];
  challengesCompleted?: Challenge[];
  streakDays?: number;
  lastLoginDate?: string;
};

// Gamification types
export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt?: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  rewardCoins: number;
  rewardXP: number;
};

export type Challenge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  maxProgress: number;
  completed: boolean;
  rewardCoins: number;
  rewardXP: number;
  expiresAt?: string;
};

// New game mode types
export type GameMode = 
  | 'phase_selective' 
  | 'duel_decisif' 
  | 'liste_piegee' 
  | 'chrono_pression' 
  | 'grille_indices';

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

export type DuelTheme = {
  id: string;
  name: string;
  wordplay: string;
  description: string;
  image?: string;
};

export type ListItem = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type FinalGridItem = {
  id: number;
  clue: string;
  image?: string;
  isRevealed: boolean;
};

export type CoinTransaction = {
  id: string;
  playerId: string;
  amount: number;
  reason: string;
  timestamp: Date;
};
