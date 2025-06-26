import { generateBots } from '@/lib/utils/generateBots';
import { PlayerDoc }     from '@/types/appwrite';

export const buildPlayerList = (
    playerIds: string[],
    allPlayerDocs: Record<string, PlayerDoc>,
    minPlayers = 4
) => {
    const real = playerIds
        .map(id => allPlayerDocs[id])
        .filter(Boolean)
        .map(d => ({
            id: d.$id,
            name: d.name,
            avatar: d.avatar,
            coins: d.coins ?? 0,
            score: d.score ?? 0,
            isBot: false,
            isEliminated: false,
            isHost: false,
        }));

    const bots = generateBots(Math.max(0, minPlayers - real.length));
    return [...real, ...bots];
};