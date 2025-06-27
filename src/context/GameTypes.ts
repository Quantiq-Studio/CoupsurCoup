
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
  | 'duel'
  | 'liste_piegee' 
  | 'chrono_pression';

export type Question = {
  id: string;
  type: GameMode
  category: 'histoire' | 'géographie' | 'sciences' | 'littérature' | 'art' | 'religion_mythologie' | 'cinéma' | 'séries' | 'musique' | 'jeux_video' | 'people' | 'cuisine' | 'sport' | 'santé' | 'langue_française' | 'technologie_internet' | 'vie_pratique' | 'questions_absurdes' | 'faux_amis_pieges' | 'vrai_ou_faux' | 'qui_suis_je' | 'emoji_quiz' | 'suites_logiques';
  tags?: string[];
  difficulty: 'facile' | 'moyen' | 'difficile';
  question: string;
  options?: string[];
  hiddenAnswer?: string;
  correct?: 'visible1' | 'visible2' | 'autre';
  theme?: string;
  correctIndex?: number;
  propositions?: string[];
  falseIndex?: number;
};

/* status possibles dans ta collection */
export type GameStatus = 'waiting' | 'playing' | 'finished';

export type Game = {
  id: string;
  roomId: string;
  hostId: string;
  playerIds: string[];

  status: GameStatus;
  round: number;
  createdAt: string;
  currentQuestionIndex: number;
  questions: string[];
  activePlayerId: string;
  timeRemaining: number;
  selectedOption: number | null;   // index cliqué par le joueur actif
  showResult    : boolean;         // quand l’animation de correction doit s’afficher
  bots          : Player[];        // tableau figé des bots (mêmes pour tous)
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
