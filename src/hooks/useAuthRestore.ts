import { useEffect } from 'react';
import { account, databases } from '@/lib/appwrite';
import { useGame } from '@/context/GameContext';

const DATABASE_ID = '68308ece00320290574e';
const PLAYERS_COLLECTION_ID = '68308f130020e76ceeec';

export const useAuthRestore = () => {
    const { setCurrentPlayer } = useGame();

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const user = await account.get();

                const player = await databases.getDocument(
                    DATABASE_ID,
                    PLAYERS_COLLECTION_ID,
                    user.$id
                );

                setCurrentPlayer({
                    id: user.$id,
                    name: player.name,
                    avatar: player.avatar,
                    email: user.email,
                    score: player.score,
                    isHost: false,
                    isEliminated: false,
                    totalScore: player.score,
                    gamesPlayed: 0,
                    gamesWon: 0,
                    coins: player.coins,
                    level: player.level,
                    experience: player.experience,
                });
            } catch (err) {
                // Pas de session trouvée ou erreur silencieuse
                console.log('No user session to restore');
            }
        };

        restoreSession().then(r =>  {
            console.log('Session restored');
        });
    }, [setCurrentPlayer]);
};