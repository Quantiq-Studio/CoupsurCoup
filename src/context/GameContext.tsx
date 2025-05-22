import React, { createContext, useState, useContext } from 'react';

export type Player = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
  isEliminated: boolean;
  // Additional properties for authenticated users
  email?: string;
  totalScore?: number;
  gamesPlayed?: number;
  gamesWon?: number;
  // Gamification properties
  level?: number;
  experience?: number;
  coins?: number;
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

// Keep existing Question type
type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

// Keep existing FinalGridItem type
type FinalGridItem = {
  id: number;
  clue: string;
  image?: string;
  isRevealed: boolean;
};

type GameContextType = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  currentPlayer: Player | null;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  roomId: string | null;
  setRoomId: React.Dispatch<React.SetStateAction<string | null>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  currentRound: number;
  setCurrentRound: React.Dispatch<React.SetStateAction<number>>;
  gridItems: FinalGridItem[];
  setGridItems: React.Dispatch<React.SetStateAction<FinalGridItem[]>>;
  finalAnswer: string;
  setFinalAnswer: React.Dispatch<React.SetStateAction<string>>;
  winner: Player | null;
  setWinner: React.Dispatch<React.SetStateAction<Player | null>>;
  isAnswering: boolean;
  setIsAnswering: React.Dispatch<React.SetStateAction<boolean>>;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  addPlayer: (player: Player) => void;
  updatePlayerScore: (playerId: string, points: number) => void;
  eliminatePlayer: (playerId: string) => void;
  resetGame: () => void;
  // New gamification functions
  addExperience: (playerId: string, xp: number) => void;
  addCoins: (playerId: string, coins: number) => void;
  addBadge: (playerId: string, badge: Badge) => void;
  updateChallenge: (playerId: string, challengeId: string, progress: number) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

// Mock data for development
const mockQuestions: Question[] = [
  {
    id: '1',
    text: "Quelle est la capitale de l'Australie ?",
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correctAnswer: 2,
    category: 'Géographie',
    difficulty: 'medium'
  },
  {
    id: '2',
    text: 'Quel est le plus grand océan du monde ?',
    options: ['Atlantique', 'Pacifique', 'Indien', 'Arctique'],
    correctAnswer: 1,
    category: 'Géographie',
    difficulty: 'easy'
  },
  {
    id: '3',
    text: 'Dans quelle ville se trouve la tour Eiffel ?',
    options: ['Londres', 'Paris', 'Rome', 'Berlin'],
    correctAnswer: 1,
    category: 'Culture générale',
    difficulty: 'easy'
  },
  {
    id: '4',
    text: "Qui a peint 'La Joconde' ?",
    options: ['Picasso', 'Van Gogh', 'Michel-Ange', 'Léonard de Vinci'],
    correctAnswer: 3,
    category: 'Art',
    difficulty: 'medium'
  },
  {
    id: '5',
    text: 'Quel est le symbole chimique du fer ?',
    options: ['F', 'Fe', 'Fr', 'Fi'],
    correctAnswer: 1,
    category: 'Science',
    difficulty: 'medium'
  },
  {
    id: '6',
    text: "Quelle est l'année de la révolution française ?",
    options: ['1689', '1789', '1889', '1989'],
    correctAnswer: 1,
    category: 'Histoire',
    difficulty: 'medium'
  },
];

const mockGridItems: FinalGridItem[] = [
  { id: 1, clue: 'Région froide', image: '/placeholder.svg', isRevealed: false },
  { id: 2, clue: 'Noir et blanc', image: '/placeholder.svg', isRevealed: false },
  { id: 3, clue: 'Mammifère marin', image: '/placeholder.svg', isRevealed: false },
  { id: 4, clue: 'Banquise', image: '/placeholder.svg', isRevealed: false },
  { id: 5, clue: 'Prédateur', image: '/placeholder.svg', isRevealed: false },
  { id: 6, clue: 'Glace', image: '/placeholder.svg', isRevealed: false },
  { id: 7, clue: 'Natation', image: '/placeholder.svg', isRevealed: false },
  { id: 8, clue: 'Poisson', image: '/placeholder.svg', isRevealed: false },
  { id: 9, clue: 'Animal', image: '/placeholder.svg', isRevealed: false },
  { id: 10, clue: 'Arctique', image: '/placeholder.svg', isRevealed: false },
  { id: 11, clue: 'Colonies', image: '/placeholder.svg', isRevealed: false },
  { id: 12, clue: 'Manchot', image: '/placeholder.svg', isRevealed: false },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [gridItems, setGridItems] = useState<FinalGridItem[]>(mockGridItems);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);

  // New gamification functions
  const addExperience = (playerId: string, xp: number) => {
    setPlayers(prev => 
      prev.map(player => {
        if (player.id === playerId) {
          const currentXP = player.experience || 0;
          const newXP = currentXP + xp;
          // Simple level calculation (can be adjusted for different level curves)
          const xpPerLevel = 100;
          const newLevel = Math.floor(newXP / xpPerLevel) + 1;
          
          // Check if player leveled up
          const hasLeveledUp = newLevel > (player.level || 1);
          
          return { 
            ...player, 
            experience: newXP,
            level: newLevel,
            // Give coins reward on level up
            coins: hasLeveledUp ? (player.coins || 0) + 50 : (player.coins || 0)
          };
        }
        return player;
      })
    );
  };

  const addCoins = (playerId: string, coins: number) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, coins: (player.coins || 0) + coins }
          : player
      )
    );
  };

  const addBadge = (playerId: string, badge: Badge) => {
    setPlayers(prev => 
      prev.map(player => {
        if (player.id === playerId) {
          // Check if player already has this badge
          if (player.badges?.some(b => b.id === badge.id)) {
            return player;
          }
          
          // Add badge with earned date
          const enrichedBadge = {
            ...badge,
            earnedAt: new Date().toISOString()
          };
          
          return { 
            ...player,
            badges: [...(player.badges || []), enrichedBadge]
          };
        }
        return player;
      })
    );
  };

  const updateChallenge = (playerId: string, challengeId: string, progress: number) => {
    setPlayers(prev => 
      prev.map(player => {
        if (player.id === playerId) {
          // Find the challenge in the player's challenges
          const playerChallenges = player.challengesCompleted || [];
          const challengeIndex = playerChallenges.findIndex(c => c.id === challengeId);
          
          // If challenge doesn't exist for this player, do nothing
          if (challengeIndex === -1) return player;
          
          const challenge = playerChallenges[challengeIndex];
          const newProgress = Math.min(challenge.maxProgress, challenge.progress + progress);
          const wasCompleted = challenge.completed;
          const isNowCompleted = newProgress >= challenge.maxProgress;
          
          // Create updated challenges array
          const updatedChallenges = [...playerChallenges];
          updatedChallenges[challengeIndex] = {
            ...challenge,
            progress: newProgress,
            completed: isNowCompleted
          };
          
          // If challenge was just completed, award rewards
          if (!wasCompleted && isNowCompleted) {
            return {
              ...player,
              challengesCompleted: updatedChallenges,
              coins: (player.coins || 0) + challenge.rewardCoins,
              experience: (player.experience || 0) + challenge.rewardXP
            };
          }
          
          return {
            ...player,
            challengesCompleted: updatedChallenges
          };
        }
        return player;
      })
    );
  };

  const addPlayer = (player: Player) => {
    // Initialize gamification properties if not present
    const enrichedPlayer = {
      ...player,
      level: player.level || 1,
      experience: player.experience || 0,
      coins: player.coins || 0,
      badges: player.badges || [],
      achievements: player.achievements || [],
      challengesCompleted: player.challengesCompleted || [],
      streakDays: player.streakDays || 0,
      lastLoginDate: player.lastLoginDate || new Date().toISOString().split('T')[0],
    };
    setPlayers(prev => [...prev, enrichedPlayer]);
  };

  const updatePlayerScore = (playerId: string, points: number) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, score: player.score + points } 
          : player
      )
    );
  };

  const eliminatePlayer = (playerId: string) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, isEliminated: true } 
          : player
      )
    );
  };

  const resetGame = () => {
    setPlayers([]);
    setCurrentPlayer(null);
    setRoomId(null);
    setQuestions(mockQuestions);
    setCurrentQuestionIndex(0);
    setCurrentRound(0);
    setGridItems(mockGridItems);
    setFinalAnswer('');
    setWinner(null);
    setIsAnswering(false);
    setTimeRemaining(10);
  };

  const value = {
    players,
    setPlayers,
    currentPlayer,
    setCurrentPlayer,
    roomId,
    setRoomId,
    questions,
    setQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    currentRound,
    setCurrentRound,
    gridItems,
    setGridItems,
    finalAnswer,
    setFinalAnswer,
    winner,
    setWinner,
    isAnswering,
    setIsAnswering,
    timeRemaining,
    setTimeRemaining,
    addPlayer,
    updatePlayerScore,
    eliminatePlayer,
    resetGame,
    // New gamification functions
    addExperience,
    addCoins,
    addBadge,
    updateChallenge,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
