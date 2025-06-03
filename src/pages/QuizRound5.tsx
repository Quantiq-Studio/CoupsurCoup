// src/pages/QuizRound5.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TimerIcon, SkipForward } from 'lucide-react';

import { useGame }        from '@/context/GameContext';
import RoundTitle         from '@/components/game/RoundTitle';
import QuestionDisplay    from '@/components/game/QuestionDisplay';
import OptionButton       from '@/components/game/OptionButton';
import PlayerStatus       from '@/components/game/PlayerStatus';
import { useBotTurn }     from '@/hooks/useBotTurn';

/* durée de départ pour chaque candidat (s) */
const START_TIME = 60;

const QuizRound5: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate   = useNavigate();

    /* --------- contexte --------- */
    const {
        questions,
        currentQuestionIndex, setCurrentQuestionIndex,
        players,
        addCoins,
        updatePlayerStatus,
        eliminatePlayer,
        goToRound,
        switchingRound,
        unlockRoundSwitch,
        setWinner
    } = useGame();

    /* déverrouille le flag dès l’arrivée sur la page */
    useEffect(() => unlockRoundSwitch(), [unlockRoundSwitch]);

    /* -------- deux derniers joueurs -------- */
    const alive = players.filter(p => !p.isEliminated);
    const [p1, p2] = alive;             // placés gauche / droite

    /* -------- chronos individuels -------- */
    const [timeLeft, setTimeLeft] = useState<Record<string, number>>({
        [p1.id]: START_TIME,
        [p2.id]: START_TIME,
    });

    /* joueur actif (celui dont le chrono tourne) */
    const [activeId, setActiveId] = useState<string>(p1.id);
    const opponentId = activeId === p1.id ? p2.id : p1.id;

    /* -------------- FIN DU JEU --------------- */
    const declareWinner = (winnerId: string, loserId: string) => {
        /* on élimine le perdant */
        eliminatePlayer(loserId);
        updatePlayerStatus(loserId, 'eliminated');

        /* on crédite le bonus AVANT de figer le winner */
        const winnerObj   = players.find(p => p.id === winnerId)!;
        const newCoins    = (winnerObj.coins ?? 0) + 500;
        addCoins(winnerId, 500);                 // persiste côté joueurs

        /* on fixe le vainqueur avec le bon total */
        setWinner({ ...winnerObj, coins: newCoins });

        /* redirection écran résultats */
        navigate(`/results/${roomId}`);
    };

    /* -------------- T I M E R ---------------- */
    useEffect(() => {
        if (switchingRound) return;                 // on ne démarre pas si transition

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev[activeId] - 1;        // ↓ 1 seconde
                if (next <= 0) {
                    declareWinner(opponentId, activeId);  // l’autre gagne
                    clearInterval(interval);              // on arrête le timer courant
                    return prev;                          // pas la peine d’enregistrer
                }
                return { ...prev, [activeId]: next };
            });
        }, 1000);                                   // 1000 ms = 1 s

        return () => clearInterval(interval);       // cleanup si changement de joueur
    }, [activeId, declareWinner, opponentId, switchingRound]);

    /* -------------- QUESTIONS ---------------- */
    const q          = questions[currentQuestionIndex];
    const options    = useMemo(() => q?.options?.slice(0, 2) ?? [], [q]);
    const correctIdx = q?.correctIndex ?? 0;

    /* -------------- SÉLECTION ---------------- */
    const [selected, setSelected] = useState<number | null>(null);
    const [showRes,  setShowRes ] = useState(false);

    const validate = (idx: number | 'pass') => {
        if (switchingRound || showRes) return;

        const isPass    = idx === 'pass';
        const isCorrect = !isPass && idx === correctIdx;

        if (isCorrect) {
            // stop chrono du joueur actuel & passe à l’adversaire
            setActiveId(opponentId);
        }
        // sinon : même joueur, chrono continue

        setSelected(isPass ? null : idx);
        setShowRes(true);

        /* scoring */
        addCoins(activeId, isCorrect ? 100 : -75);
        if (!isCorrect && !isPass) updatePlayerStatus(activeId, 'orange');

        /* petite pause puis on poursuit */
        setTimeout(() => {
            setShowRes(false);
            setSelected(null);

            /* question suivante */
            setCurrentQuestionIndex(i => (i + 1) % questions.length);
        }, 1200);
    };

    /* -------------- BOT --------------------- */
    const activePlayer = alive.find(p => p.id === activeId);

    useBotTurn({
        isBotTurn  : !!activePlayer?.isBot && !showRes && !switchingRound,
        answer     : () => {
            const roll = Math.random();
            if (roll < 0.25) return validate('pass');
            if (roll < 0.65) return validate(correctIdx);
            return validate(1 - correctIdx);
        },
        correctIndex: correctIdx,
        nbOptions   : 2,
        successRate : 0.4,
        minDelayMs  : 700,
        maxDelayMs  : 2500,
    });

    /* -------------- UI ---------------------- */
    if (!q) return null;

    /* couleur du feedback */
    const feedback =
        selected === null     ? { txt: 'Passe',           cls: 'text-yellow-300' } :
            selected === correctIdx
                ? { txt: 'Bonne réponse !', cls: 'text-green-400'  } :
                { txt: 'Mauvaise réponse !', cls: 'text-red-400' };

    return (
        <div className="min-h-screen bg-game-gradient flex flex-col py-8">
            <RoundTitle
                roundNumber={5}
                title="Chrono-Pression"
                description="60 s chacun ; seul un maître survivra !"
            />

            {/* ---- face-à-face ---- */}
            <div className="flex items-center justify-center gap-8 mb-8">
                {[p1, p2].map(p => (
                    <div key={p.id} className="flex flex-col items-center space-y-2">
                        <PlayerStatus player={p} showCoins isActive={activeId === p.id} />
                        <div className="flex items-center gap-1">
                            <TimerIcon className="h-4 w-4 text-white" />
                            <span className="text-white font-mono tabular-nums">
                {timeLeft[p.id]} s
              </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---- question ---- */}
            <div className="mx-auto max-w-2xl w-full bg-white/10 p-6 rounded-xl">
                <QuestionDisplay
                    question={q.question}
                    category={q.category}
                    difficulty={q.difficulty}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 place-items-center">
                    {options.map((opt, idx) => (
                        <OptionButton
                            key={idx}
                            label={opt}
                            selected={selected === idx}
                            correct={showRes && idx === correctIdx}
                            incorrect={showRes && selected === idx && idx !== correctIdx}
                            disabled={showRes || activePlayer?.isBot}
                            onClick={() => validate(idx)}
                        />
                    ))}

                    {/* bouton PASSER centré */}
                    <div className="sm:col-span-2 w-full flex justify-center">
                        <OptionButton
                            label={<><SkipForward className="inline h-4 w-4 mr-2" />Passer</>}
                            selected={selected === null}
                            disabled={showRes || activePlayer?.isBot}
                            onClick={() => validate('pass')}
                        />
                    </div>
                </div>

                {/* ---- feedback ---- */}
                {showRes && (
                    <p className={`text-center mt-6 text-xl font-bold animate-bounce-in ${feedback.cls}`}>
                        {feedback.txt}
                        {selected !== null && selected !== correctIdx && (
                            <>
                                <br />
                                <span className="text-white">Bonne réponse : {options[correctIdx]}</span>
                            </>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};

export default QuizRound5;