import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import RoundTitle from '@/components/game/RoundTitle';
import { GameNotification } from '@/components/ui/game-notification';
import { GameButton } from '@/components/ui/game-button';
import PlayerStatus from '@/components/game/PlayerStatus';
import { AlertCircle } from 'lucide-react';
import { useBotTurn } from '@/hooks/useBotTurn';

/* ------------------------------------------------------------------ */

const DuelSelectPage: React.FC = () => {
    /* ---------- routing / données de base -------------------------- */
    const { roomId, challengerId } =
        useParams<{ roomId: string; challengerId: string }>();

    const navigate          = useNavigate();
    const { players }       = useGame();

    const [opponentId, setOpponentId] = useState<string | null>(null);

    const challenger = players.find(p => p.id === challengerId);
    const opponents  = players.filter(
        p => !p.isEliminated && p.id !== challengerId
    );

    /* ---------- bot : choix automatique d’un adversaire ------------- */
    useBotTurn({
        isBotTurn: !!challenger?.isBot && !opponentId && opponents.length > 0,
        answer: idx => setOpponentId(opponents[idx].id),
        correctIndex: 0,          // peu importe, on ignore le « succès »
        nbOptions: opponents.length,
        successRate: 0.5,         // 50 % de « préférence » (pas utilisé ici)
        minDelayMs: 1200,
        maxDelayMs: 3500,
    });

    /* ---------- quand un choix est défini par le bot ---------------- */
    useEffect(() => {
        if (opponentId && challenger?.isBot) {
            // On laisse 1 s pour voir le bouton se sélectionner avant de partir
            const t = setTimeout(
                () => navigate(`/duel/${roomId}/${challengerId}/${opponentId}`),
                1000
            );
            return () => clearTimeout(t);
        }
    }, [opponentId, challenger?.isBot, roomId, challengerId, navigate]);

    /* ---------- clic humain ---------------------------------------- */
    const handleStart = () => {
        if (!opponentId) return;
        navigate(`/duel/${roomId}/${challengerId}/${opponentId}`);
    };

    /* ---------------------------------------------------------------- */
    return (
        <div className="min-h-screen bg-game-gradient flex flex-col py-8">
            <RoundTitle
                roundNumber={2}
                title="Choix de l’adversaire"
                description={
                    challenger?.name
                        ? `${challenger.name} doit sélectionner un joueur à défier.`
                        : 'Sélection de l’adversaire'
                }
            />

            {/* --- Challenger mis en avant -------------------------------- */}
            {challenger && (
                <div className="max-w-sm mx-auto mb-6 animate-fade-in-slow">
                    <PlayerStatus
                        player={challenger}
                        isActive
                        showCoins
                    />
                </div>
            )}

            {/* --- Zone de sélection ------------------------------------- */}
            <div className="mx-auto w-full max-w-xl bg-white/10 p-6 rounded-xl animate-bounce-in">
                <GameNotification
                    title="Duel décisif !"
                    message="Choisissez votre adversaire"
                    variant="error"
                    icon={AlertCircle}
                    className="mb-4"
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {opponents.map(p => (
                        <GameButton
                            key={p.id}
                            variant={opponentId === p.id ? 'accent' : 'secondary'}
                            onClick={() => setOpponentId(p.id)}
                            disabled={!!challenger?.isBot}              /* un bot n’a pas besoin de clic */
                        >
                            {p.name}
                        </GameButton>
                    ))}
                </div>

                {/* bouton start uniquement pour humain */}
                {!challenger?.isBot && (
                    <div className="flex justify-center">
                        <GameButton
                            variant="accent"
                            disabled={!opponentId}
                            onClick={handleStart}
                        >
                            Lancer le duel
                        </GameButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DuelSelectPage;