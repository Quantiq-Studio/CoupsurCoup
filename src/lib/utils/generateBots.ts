export interface BotPlayer {
    id: string;
    name: string;
    avatar: string;
    score: number;
    coins: number;
    isBot: true;
    isHost: false;
    isEliminated: false;
}

const BOT_NAMES = [
    'Alice', 'Bob', 'Charlie', 'Dave', 'Eve',
    'Frank', 'Grace', 'Heidi', 'Ivan', 'Nina',
    'Oscar', 'Paul', 'Quinn', 'Rita', 'Sam', 'Tina',
];

/**
 * Retourne un tableau de bots prêts à être insérés dans `players`.
 *
 * @param count  Nombre de bots souhaité
 */
export const generateBots = (count: number): BotPlayer[] => {
    // Mélange simple (Fisher-Yates) pour avoir des noms variés
    const names = [...BOT_NAMES];
    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
    }

    return names.slice(0, count).map((name, idx) => ({
        id: `bot-${idx + 1}`,                                     // bot-1, bot-2…
        name,
        avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=bot${idx + 1}`,
        score: 0,
        coins: 1_000,
        isBot: true,
        isHost: false,
        isEliminated: false,
    }));
};