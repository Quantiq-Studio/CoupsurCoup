import { useEffect } from 'react';
import { client, databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import { useGame } from '@/context/GameContext';
import { PlayerDoc } from '@/types/appwrite';
import { buildPlayerList } from '@/lib/buildPlayerList';
import { useNavigate } from 'react-router-dom';

interface GameDoc extends Models.Document {
    roomId: string;
    status: 'waiting' | 'playing' | 'finished';
    round: number;
    currentQuestionIndex: number;
    questions: string[];
    hostId: string;
    playerIds: string[];
}

const DATABASE_ID           = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const GAMES_COLLECTION_ID   = import.meta.env.VITE_APPWRITE_GAMES_COLLECTION_ID;
const PLAYERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PLAYERS_COLLECTION_ID;

export const useGameRealtime = (roomId?: string) => {
    console.log('[realtime] hook mount - roomId =', roomId);

    const {
        setCurrentRound,
        setCurrentQuestionIndex,
        setPlayers,
        loadQuestions,
        questions,
    } = useGame();

    const navigate = useNavigate();

    useEffect(() => {
        if (!roomId) return;
        console.log('[realtime] useEffect → start for', roomId);

        let unsubscribe: (() => void) | undefined;

        (async () => {
            /* ─── 1. récup doc game ─────────────────────────────── */
            const { documents } = await databases.listDocuments<GameDoc>(
                DATABASE_ID,
                GAMES_COLLECTION_ID,
                [Query.equal('roomId', roomId)]
            );
            const game = documents[0];
            console.log('[realtime] game doc fetched =', game);
            if (!game) return;

            /* ─── 2. fetch initial players + éventuelle hydr. Q ─── */
            try {
                const docs = await Promise.all(
                    game.playerIds.map(id =>
                        databases
                            .getDocument<PlayerDoc>(DATABASE_ID, PLAYERS_COLLECTION_ID, id)
                            .catch(err => {
                                console.warn('[realtime] getDocument failed for', id, err);
                                return null;
                            })
                    )
                );
                const byId = Object.fromEntries(
                    docs.filter(Boolean).map(d => [d.$id, d as PlayerDoc])
                );
                const initialPlayers = buildPlayerList(game.playerIds, byId, 4).map(p => ({
                    ...p,
                    isHost: p.id === game.hostId,
                }));
                console.log('[realtime] initial players list =', initialPlayers);

                setPlayers(initialPlayers);
                setCurrentRound(game.round);
                setCurrentQuestionIndex(game.currentQuestionIndex);

                if (game.questions?.length && questions.length === 0) {
                    console.log('[realtime] hydrate initial questions');
                    await loadQuestions(game.questions);
                }
            } catch (err) {
                console.warn('[realtime] initial fetch players failed', err);
            }

            /* ─── 3. souscription Realtime ───────────────────────── */
            const channel =
                `databases.${DATABASE_ID}.collections.${GAMES_COLLECTION_ID}.documents.${game.$id}`;
            console.log('[realtime] subscribing to', channel);

            unsubscribe = client.subscribe<GameDoc>(channel, async (msg) => {
                console.log('[realtime] message received', msg);
                const g = msg.payload;

                /* hydrater les questions si besoin */
                if (g.questions?.length && questions.length === 0) {
                    console.log('[realtime] hydrate questions from realtime event');
                    await loadQuestions(g.questions);
                }

                /* maj players */
                const docs = await Promise.all(
                    g.playerIds.map(id =>
                        databases
                            .getDocument<PlayerDoc>(DATABASE_ID, PLAYERS_COLLECTION_ID, id)
                            .catch(err => {
                                console.warn('[realtime] getDocument failed for', id, err);
                                return null;
                            })
                    )
                );
                const byId = Object.fromEntries(
                    docs.filter(Boolean).map(d => [d.$id, d as PlayerDoc])
                );
                console.log('[realtime] fetched player docs =', byId);

                const players = buildPlayerList(g.playerIds, byId, 4).map(p => ({
                    ...p,
                    isHost: p.id === g.hostId,
                }));
                console.log('[realtime] final players list =', players);
                setPlayers(players);

                /* maj round / index */
                setCurrentRound(g.round);
                setCurrentQuestionIndex(g.currentQuestionIndex);
                console.log('[realtime] round=', g.round,
                    'questionIdx=', g.currentQuestionIndex,
                    'status=', g.status);

                if (g.status === 'playing') {
                    navigate(`/round${g.round}/${roomId}`, { replace: true });
                }
            });
        })();

        return () => {
            console.log('[realtime] cleanup / unsubscribe');
            unsubscribe?.();
        };
    }, [roomId]);
};