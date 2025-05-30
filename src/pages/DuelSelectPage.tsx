import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import RoundTitle from '@/components/game/RoundTitle';
import { GameNotification } from '@/components/ui/game-notification';
import { GameButton } from '@/components/ui/game-button';
import { AlertCircle } from 'lucide-react';

const DuelSelectPage: React.FC = () => {
    const { roomId, challengerId } =
        useParams<{ roomId: string; challengerId: string }>();

    const navigate          = useNavigate();
    const { players }       = useGame();
    const [opponentId, setOpponentId] = useState<string | null>(null);

    const challenger = players.find(p => p.id === challengerId);
    const active     = players.filter(p => !p.isEliminated && p.id !== challengerId);

    const handleStart = () => {
        if (!opponentId) return;
        navigate(`/duel/${roomId}/${challengerId}/${opponentId}`);
    };

    return (
        <div className="min-h-screen bg-game-gradient flex flex-col py-8">
            <RoundTitle
                roundNumber={2}
                title="Choix de l’adversaire"
                description={`${challenger?.name ?? '???'} doit sélectionner un joueur à défier.`}
            />

            <div className="mx-auto w-full max-w-xl bg-white/10 p-6 rounded-xl animate-bounce-in">
                <GameNotification
                    title="Duel décisif !"
                    message="Choisissez votre adversaire"
                    variant="error"
                    icon={AlertCircle}
                    className="mb-4"
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {active.map(p => (
                        <GameButton
                            key={p.id}
                            variant={opponentId === p.id ? 'accent' : 'secondary'}
                            onClick={() => setOpponentId(p.id)}
                        >
                            {p.name}
                        </GameButton>
                    ))}
                </div>

                <div className="flex justify-center">
                    <GameButton
                        variant="accent"
                        disabled={!opponentId}
                        onClick={handleStart}
                    >
                        Lancer le duel
                    </GameButton>
                </div>
            </div>
        </div>
    );
};

export default DuelSelectPage;