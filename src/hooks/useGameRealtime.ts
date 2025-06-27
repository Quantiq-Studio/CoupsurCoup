/* ─── useGameRealtime.ts ─────────────────────────────────────────── */
import { useEffect }        from 'react';
import { client, databases } from '@/lib/appwrite';
import { Query, Models }     from 'appwrite';
import { useGame }           from '@/context/GameContext';
import { PlayerDoc }         from '@/types/appwrite';
import { buildPlayerList }   from '@/lib/buildPlayerList';
import { useNavigate }       from 'react-router-dom';

/* ---------- types ----------- */
interface GameDoc extends Models.Document {
    roomId           : string;
    status           : 'waiting' | 'playing' | 'finished';
    round            : number;
    currentQuestionIndex: number;
    questions        : string[];
    hostId           : string;
    playerIds        : string[];
    /* 🔽  nouveaux champs partagés  🔽 */
    bots            ?: PlayerDoc[];       // tableau figé de bots
    activePlayerId   : string;
    timeRemaining    : number;
    selectedOption  ?: number | null;
    showResult       : boolean;
}

/* ---------- const ---------- */
const DB_ID        = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const GAMES_ID     = import.meta.env.VITE_APPWRITE_GAMES_COLLECTION_ID;
const PLAYERS_ID   = import.meta.env.VITE_APPWRITE_PLAYERS_COLLECTION_ID;

/* ---------- hook ----------- */
export const useGameRealtime = (roomId?: string) => {
    const {
        /* setters globaux ------------------------------------------------ */
        setPlayers, setCurrentRound, setCurrentQuestionIndex,
        setActivePlayerId, setTimeRemaining,
        setSelectedOption, setShowResult,
        /* questions ------------------------------------------------------ */
        loadQuestions, questions,
    } = useGame();

    const navigate = useNavigate();

    useEffect(() => {
        if (!roomId) return;
        console.log('[realtime] useEffect → start for', roomId);

        let unsub: () => void;

        (async () => {
            /* 1️⃣  doc « game » ------------------------------------------------ */
            const { documents } = await databases.listDocuments<GameDoc>(
                DB_ID, GAMES_ID, [ Query.equal('roomId', roomId) ]
            );
            const game = documents[0];
            console.log('[realtime] game doc fetched =', game);
            if (!game) return;

            /* 2️⃣  hydrate players (+ bots)  ----------------------------------- */
            const hydratePlayers = async (ids: string[], bots?: PlayerDoc[]) => {
                const docs = await Promise.all(
                    ids.map(id =>
                        databases.getDocument<PlayerDoc>(DB_ID, PLAYERS_ID, id).catch(() => null)
                    )
                );
                const byId = Object.fromEntries(
                    docs.filter(Boolean).map(d => [d.$id, d as PlayerDoc])
                );

                const humanPlayers = buildPlayerList(ids, byId, 4).map(p => ({
                    ...p, isHost: p.id === game.hostId,
                }));

                // on concatène les bots (mêmes pour tout le monde)
                const finalList = [
                    ...humanPlayers,
                    ...(bots ?? [])
                ];

                setPlayers(finalList);
            };

            await hydratePlayers(game.playerIds, game.bots);

            /* hydrate état partagé + questions ------------------------------ */
            setCurrentRound(game.round);
            setCurrentQuestionIndex(game.currentQuestionIndex);
            setActivePlayerId(game.activePlayerId);
            setTimeRemaining(game.timeRemaining);
            setSelectedOption(game.selectedOption ?? null);
            setShowResult(game.showResult);

            if (game.questions.length && questions.length === 0) {
                await loadQuestions(game.questions);
            }

            /* 3️⃣  subscribe realtime ---------------------------------------- */
            const channel = `databases.${DB_ID}.collections.${GAMES_ID}.documents.${game.$id}`;
            unsub = client.subscribe<GameDoc>(channel, async msg => {
                const g = msg.payload;

                /* hydrate players/bots */
                await hydratePlayers(g.playerIds, g.bots);

                /* hydrate état partagé  */
                setCurrentRound(g.round);
                setCurrentQuestionIndex(g.currentQuestionIndex);
                setActivePlayerId(g.activePlayerId);
                setTimeRemaining(g.timeRemaining);
                setSelectedOption(g.selectedOption ?? null);
                setShowResult(g.showResult);

                /* questions si arrivée tardive */
                if (g.questions.length && questions.length === 0) {
                    await loadQuestions(g.questions);
                }

                /* navigation auto round ↔ route */
                if (g.status === 'playing') {
                    navigate(`/round${g.round}/${roomId}`, { replace: true });
                }
            });
        })();

        return () => unsub?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);
};