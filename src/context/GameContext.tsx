import React, {createContext, useState, useContext} from "react";
import {
    Player,
    PlayerStatus,
    Badge,
    Achievement,
    Challenge,
    Question,
    FinalGridItem,
    GameMode,
    CoinTransaction, Game,
} from "./GameTypes";
import {databases} from "@/lib/appwrite";
import {Query} from "appwrite";

/* ────────────────────────────────────────────
   Constantes Appwrite
────────────────────────────────────────────── */
const DATABASE_ID = "68308ece00320290574e";
const QUESTIONS_COLLECTION_ID = "68308f0a000e5d7eb2ee";

/* ────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
const toQuestion = (doc: any): Question => {
    // options / propositions → string[]
    const raw = doc.options ?? doc.propositions ?? [];
    const options: string[] = raw.map((o: any) =>
        typeof o === "string" ? o : o.label ?? o.text ?? ""
    );

    return {
        id: doc.$id,
        type: doc.type as GameMode,
        category: doc.category,
        tags: doc.tags,
        difficulty: doc.difficulty,
        question: doc.question ?? doc.text ?? "",

        /* champs optionnels spécifiques au mode -------------------------------- */
        options: options.length ? options : undefined,
        hiddenAnswer: doc.hiddenAnswer,
        correct: doc.correct,
        correctIndex: doc.correctIndex,
        propositions: options.length ? options : undefined,
        falseIndex: doc.falseIndex,
        theme: doc.theme,
    };
};

const toGame = (doc: any): Game => ({
    id: doc.$id,
    roomId: doc.roomId,
    hostId: doc.hostId,
    playerIds: doc.playerIds ?? [],

    status: doc.status,
    round: doc.round,
    createdAt: doc.createdAt,
    currentQuestionIndex: doc.currentQuestionIndex ?? 0,
    questions: doc.questions ?? [],
});

const mockGridItems: FinalGridItem[] = [
    {id: 1, clue: "Région froide", image: "/placeholder.svg", isRevealed: false},
    {id: 2, clue: "Noir et blanc", image: "/placeholder.svg", isRevealed: false},
    {id: 3, clue: "Mammifère marin", image: "/placeholder.svg", isRevealed: false},
    {id: 4, clue: "Banquise", image: "/placeholder.svg", isRevealed: false},
    {id: 5, clue: "Prédateur", image: "/placeholder.svg", isRevealed: false},
    {id: 6, clue: "Glace", image: "/placeholder.svg", isRevealed: false},
    {id: 7, clue: "Natation", image: "/placeholder.svg", isRevealed: false},
    {id: 8, clue: "Poisson", image: "/placeholder.svg", isRevealed: false},
    {id: 9, clue: "Animal", image: "/placeholder.svg", isRevealed: false},
    {id: 10, clue: "Arctique", image: "/placeholder.svg", isRevealed: false},
    {id: 11, clue: "Colonies", image: "/placeholder.svg", isRevealed: false},
    {id: 12, clue: "Manchot", image: "/placeholder.svg", isRevealed: false},
];

/* ────────────────────────────────────────────
   Types du contexte
────────────────────────────────────────────── */
type GameContextType = {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;

    currentPlayer: Player | null;
    setCurrentPlayer: React.Dispatch<React.SetStateAction<Player | null>>;

    game: Game | null;
    setGame: React.Dispatch<React.SetStateAction<Game | null>>;

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

    gameMode: GameMode;
    setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;

    playerStatus: Record<string, PlayerStatus>;
    setPlayerStatus: React.Dispatch<React.SetStateAction<Record<string, PlayerStatus>>>;

    coinTransactions: CoinTransaction[];
    setCoinTransactions: React.Dispatch<React.SetStateAction<CoinTransaction[]>>;

    /* Fonctions de jeu */
    addPlayer: (player: Player) => void;
    updatePlayerScore: (playerId: string, points: number) => void;
    eliminatePlayer: (playerId: string) => void;
    resetGame: () => void;

    updatePlayerStatus: (playerId: string, status: PlayerStatus) => void;
    addCoins: (playerId: string, amount: number) => void;
    addExperience: (playerId: string, xp: number) => void;
    addBadge: (playerId: string, badge: Badge) => void;
    updateChallenge: (playerId: string, challengeId: string, progress: number) => void;

    /* ↓↓↓  NOUVEAU  ↓↓↓ */
    loadQuestions: (ids?: string[]) => Promise<string[]>;
    getRoundBounds: (round: number) => [number, number];
};

const GameContext = createContext<GameContextType | undefined>(undefined);

/* ────────────────────────────────────────────
   GameProvider
────────────────────────────────────────────── */
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    /* ── States ───────────────────── */
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentRound, setCurrentRound] = useState(0);

    const [gridItems, setGridItems] = useState<FinalGridItem[]>(mockGridItems);
    const [finalAnswer, setFinalAnswer] = useState("");

    const [game, setGame]   = useState<Game | null>(null);
    const [winner, setWinner] = useState<Player | null>(null);

    const [isAnswering, setIsAnswering] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(10);
    const [gameMode, setGameMode] = useState<GameMode>("phase_selective");

    const [playerStatus, setPlayerStatus] = useState<Record<string, PlayerStatus>>({});
    const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([]);

    /* ── Pioche & chargement des questions ───────────────────── */

    // génère un tableau de 60 IDs déjà ordonné par round
    const drawRandomQuestionIds = async (): Promise<string[]> => {
        const quotasOrdered = [
            { type: "phase_selective", count: 25 }, // Round 1
            { type: "duel",            count: 1  }, // Round 2
            { type: "liste_piegee",    count: 3  }, // Round 3
            { type: "duel",            count: 1  }, // Round 4
            { type: "chrono_pression", count: 25 }, // Round 5
            { type: "grille_indices",  count: 5  }, // Round 6
        ];

        const ids: string[] = [];

        for (const { type, count } of quotasOrdered) {
            const res = await databases.listDocuments(
                DATABASE_ID,
                QUESTIONS_COLLECTION_ID,
                [
                    Query.equal("type", type),
                    Query.select(["$id"]),
                    Query.limit(1000),
                ]
            );
            if (res.total < count) {
                throw new Error(`Pas assez de questions pour le type « ${type} » (disponibles: ${res.total})`);
            }

            ids.push(
                ...res.documents
                    .sort(() => 0.5 - Math.random()) // tirage aléatoire à l'intérieur du type
                    .slice(0, count)
                    .map((d: any) => d.$id)
            );
        }

        // ‼️ Pas de shuffle global – l'ordre détermine les rounds
        return ids;
    };

    // bornes [start, end] (index, inclusifs) pour chaque round
    const ROUND_BOUNDS: [number, number][] = [
        [0, 24],  // R1 – phase_selective
        [25, 25], // R2 – duel
        [26, 28], // R3 – liste_piegee
        [29, 29], // R4 – duel
        [30, 54], // R5 – chrono_pression
        [55, 59], // R6 – grille_indices
    ];
    const getRoundBounds = (round: number): [number, number] => ROUND_BOUNDS[round - 1] ?? [0, 0];

    /**
     * Charge les questions :
     *  - si `ids` est fourni → lecture simple
     *  - sinon → tirage (hôte)
     * Renvoie toujours le tableau d'IDs utilisé.
     */
    const loadQuestions = async (ids?: string[]): Promise<string[]> => {
        let questionIds = ids;
        if (!questionIds || questionIds.length === 0) {
            questionIds = await drawRandomQuestionIds();
        }

        const docs = await Promise.all(
            questionIds.map((id) =>
                databases.getDocument(DATABASE_ID, QUESTIONS_COLLECTION_ID, id)
            )
        );
        setQuestions(docs.map(toQuestion));
        return questionIds;
    };

    /* ── GESTION DES JOUEURS / COINS / ETC. ───────────── */

    // Update player status (green, orange, red, eliminated)
    const updatePlayerStatus = (playerId: string, status: PlayerStatus) => {
        setPlayerStatus(prev => ({
            ...prev,
            [playerId]: status
        }));

        // If player is eliminated, update that flag too
        if (status === 'eliminated') {
            eliminatePlayer(playerId);
        }
    };

    // Add coins to a player
    const addCoins = (playerId: string, amount: number) => {
        const reason = amount > 0 ? 'Gain' : 'Perte';

        // Add transaction record
        setCoinTransactions(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                playerId,
                amount,
                reason,
                timestamp: new Date()
            }
        ]);

        // Update player coins
        setPlayers(prev =>
            prev.map(player => {
                if (player.id === playerId) {
                    return {
                        ...player,
                        coins: (player.coins || 1000) + amount
                    };
                }
                return player;
            })
        );
    };

    // Add experience
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
                        coins: hasLeveledUp ? (player.coins || 1000) + 50 : (player.coins || 1000)
                    };
                }
                return player;
            })
        );
    };

    // Add badge to a player
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

    // Update challenge progress
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
                            coins: (player.coins || 1000) + challenge.rewardCoins,
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

    // Add a new player
    const addPlayer = (player: Player) => {
        // Initialize gamification properties if not present
        const enrichedPlayer = {
            ...player,
            level: player.level || 1,
            experience: player.experience || 0,
            coins: player.coins || 1000, // Initialize with 1000 coins
            badges: player.badges || [],
            achievements: player.achievements || [],
            challengesCompleted: player.challengesCompleted || [],
            streakDays: player.streakDays || 0,
            lastLoginDate: player.lastLoginDate || new Date().toISOString().split('T')[0],
            status: 'green' as PlayerStatus
        };

        setPlayers(prev => [...prev, enrichedPlayer]);

        // Initialize player status
        setPlayerStatus(prev => ({
            ...prev,
            [enrichedPlayer.id]: 'green'
        }));
    };

    // Update player score
    const updatePlayerScore = (playerId: string, points: number) => {
        setPlayers(prev =>
            prev.map(player =>
                player.id === playerId
                    ? {...player, score: player.score + points}
                    : player
            )
        );
    };

    // Eliminate a player
    const eliminatePlayer = (playerId: string) => {
        setPlayers(prev =>
            prev.map(player =>
                player.id === playerId
                    ? {...player, isEliminated: true}
                    : player
            )
        );

        // Update player status to eliminated
        setPlayerStatus(prev => ({
            ...prev,
            [playerId]: 'eliminated'
        }));
    };
    /* ── Reset ───────────────────── */
    const resetGame = () => {
        setPlayers([]);
        setCurrentPlayer(null);
        setRoomId(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setCurrentRound(0);
        setGridItems(mockGridItems);
        setFinalAnswer("");
        setWinner(null);
        setIsAnswering(false);
        setTimeRemaining(10);
        setGameMode("phase_selective");
        setPlayerStatus({});
        setCoinTransactions([]);
    };

    /* ── Contexte exporté ───────────────────── */
    const value: GameContextType = {
        game,
        setGame,
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
        gameMode,
        setGameMode,
        playerStatus,
        setPlayerStatus,
        coinTransactions,
        setCoinTransactions,

        /* fonctions de jeu */
        addPlayer,            // <-- garde les tiens
        updatePlayerScore,
        eliminatePlayer,
        resetGame,
        updatePlayerStatus,
        addCoins,
        addExperience,
        addBadge,
        updateChallenge,

        /* nouveau */
        loadQuestions,
        getRoundBounds,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/* ──────────────────────────────────────────── */
export const useGame = () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used within a GameProvider");
    return ctx;
};

/* Re-export des types */
export type {Player, Badge, Achievement, Challenge, PlayerStatus};
