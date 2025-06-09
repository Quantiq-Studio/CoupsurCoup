import { useEffect } from 'react';
import { account }   from '@/lib/appwrite';
import { useGame }   from '@/context/GameContext';
import {ensurePlayerDoc} from "@/lib/ensurePlayerDoc.ts";

export const useAuthRestore = () => {
    const { setCurrentPlayer } = useGame();

    useEffect(() => {
        (async () => {
            try {
                /* 1️⃣  récupère la session courante */
                const currentSession = await account.getSession('current');

                /* 2️⃣  on ignore si c’est une session anonyme */
                if (currentSession.provider === 'anonymous') {
                    await account.deleteSession('current');  // détruit la session anonyme
                    console.log('Anonymous session detected – skipping restore');
                    return;
                }

                /* 3️⃣  utilisateur “normal” : on restaure le profil */
                const user    = await account.get();
                const player  = await ensurePlayerDoc(user);   // crée si absent

                setCurrentPlayer({
                    id     : user.$id,
                    name   : player.name,
                    avatar : player.avatar,
                    email  : user.email,
                    score  : player.score,
                    coins  : player.coins,
                    level  : player.level,
                    experience : player.experience,
                    totalScore  : player.score,
                    gamesPlayed : 0,
                    gamesWon    : 0,
                    isHost      : false,
                    isEliminated: false,
                });
            } catch {
                /* aucune session valide → rien à restaurer */
            }
        })();
    }, [setCurrentPlayer]);
};