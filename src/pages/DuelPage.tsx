import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CheckCircle,
    XCircle,
} from 'lucide-react';

import { useGame }           from '@/context/GameContext';
import RoundTitle            from '@/components/game/RoundTitle';
import QuestionDisplay       from '@/components/game/QuestionDisplay';
import OptionButton          from '@/components/game/OptionButton';
import PlayerStatus          from '@/components/game/PlayerStatus';
import { GameButton }        from '@/components/ui/game-button';
import { useBotTurn }        from '@/hooks/useBotTurn';
import { cn }                from '@/lib/utils';
import { databases }         from '@/lib/appwrite';

/* ------------------------------------------------------------------ */
const DATABASE_ID         = '68308ece00320290574e';
const GAMES_COLLECTION_ID = '68308f180030b8019d46';

/* ------------------------------------------------------------------ */
const DuelPage: React.FC = () => {
    const { roomId, challengerId, opponentId } =
        useParams<{ roomId: string; challengerId: string; opponentId: string }>();

    const navigate = useNavigate();

    /* --------------------- contexte -------------------- */
    const {
        questions,
        players,
        currentPlayer,

        eliminatePlayer,
        goToRound,

        switchingRound,
        unlockRoundSwitch,
    } = useGame();

    /* déverrouille dès le montage (utile si l’on revient
       directement du round précédent) */
    useEffect(() => unlockRoundSwitch(), []);

    const challenger = players.find(p => p.id === challengerId);
    const opponent   = players.find(p => p.id === opponentId);

    /* ---------------- étape 1 : choix thème ------------- */
    const duelQuestions = useMemo(
        () => questions.filter(q => q.type === 'duel'),
        [questions]
    );

    const [qA, qB]      = duelQuestions.slice(0, 2);
    const [chosen, setChosen] = useState<'A' | 'B' | null>(null);
    const question = chosen === 'A' ? qA : chosen === 'B' ? qB : undefined;

    /* ----------- BOT choisit un thème ------------------ */
    useBotTurn({
        isBotTurn: !!opponent?.isBot && !chosen && !switchingRound,
        answer   : i => setChosen(i === 0 ? 'A' : 'B'),
        correctIndex: Math.floor(Math.random() * 2),
        nbOptions   : 2,
        successRate : 1,
        minDelayMs  : 2000,
        maxDelayMs  : 5000,
    });

    /* -------------- étape 2 : répondre ----------------- */
    const [selected,  setSelected ] = useState<number | null>(null);
    const [showRes,   setShowRes  ] = useState(false);

    const opts = useMemo(() => {
        if (!question) return [];
        const base = [...(question.options ?? [])];
        if (question.hiddenAnswer && !base.includes(question.hiddenAnswer))
            base.push(question.hiddenAnswer);
        return base;
    }, [question]);

    const correctIdx = useMemo(() => {
        if (!question) return -1;
        if (question.correct === 'autre')
            return opts.findIndex(o => o === question.hiddenAnswer);
        if (question.correct?.startsWith('visible'))
            return parseInt(question.correct.replace('visible', ''), 10) - 1;
        return question.correctIndex ?? -1;
    }, [question, opts]);


    const handleClick = (idx: number) => {
        if (switchingRound || selected !== null || !question) return;
        setSelected(idx);
        setShowRes(true);
        finish(idx === correctIdx);
    };

    /* -------------- BOT répond ------------------------- */
    useBotTurn({
        isBotTurn   : !!opponent?.isBot && !!question && !showRes && !switchingRound,
        answer      : handleClick,
        correctIndex: correctIdx,
        nbOptions   : opts.length,
        successRate : 0.6,
        minDelayMs  : 1500,
        maxDelayMs  : 4000,
    });

    /* ---------------- outcome ------------------------- */
    const finish = async (answerIsRight: boolean) => {
        if (answerIsRight) eliminatePlayer(challengerId!);
        else               eliminatePlayer(opponentId!);

        /* petite pause pour l’animation “bonne / mauvaise” */
        setTimeout(async () => {
            /* Go → Round 3 (déclenche le flag switchingRound) */
            goToRound(3);

            /* persistence en base */
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    GAMES_COLLECTION_ID,
                    roomId!,
                    { round: 3 },
                );
            } catch (err) {
                console.error('Sync round → BDD échouée :', err);
            }

            navigate(`/round3/${roomId}`);
        }, 2000);
    };

    /* --------------------------- UI -------------------- */
    if (!qA || !qB) {
        return <p className="text-white p-8">Aucune question de duel disponible.</p>;
    }

    return (
        <div className="min-h-screen bg-game-gradient flex flex-col py-8">
            <RoundTitle
                roundNumber={2}
                title="Duel décisif"
                description={
                    !chosen
                        ? `${opponent?.name ?? '???'} choisit un thème`
                        : `${opponent?.name ?? '???'} répond !`
                }
            />

            {/* ---------- entête joueurs ------------- */}
            <div className="flex justify-center gap-8 mb-6">
                <PlayerStatus player={challenger!} status={challenger?.status} showCoins />
                <span className="text-2xl text-white font-bold">VS</span>
                <PlayerStatus player={opponent!}   status={opponent?.status}  showCoins />
            </div>

            {/* --------------- choix thème ------------- */}
            {!chosen && (
                <div className="mx-auto w-full max-w-lg bg-white/10 p-6 rounded-xl animate-bounce-in">
                    <h3 className="text-center text-white mb-6">Choisis ton thème</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[qA, qB].map((q, i) => (
                            <GameButton
                                key={i}
                                variant="secondary"
                                onClick={() => setChosen(i === 0 ? 'A' : 'B')}
                                disabled={
                                    switchingRound || currentPlayer?.id !== opponentId
                                }
                            >
                                {q.theme ?? q.category}
                            </GameButton>
                        ))}
                    </div>
                </div>
            )}

            {/* --------------- question ---------------- */}
            {question && (
                <div className="mx-auto mt-8 max-w-2xl w-full bg-white/10 p-6 rounded-xl animate-fade-in-slow">
                    <QuestionDisplay
                        question={question.question}
                        category={question.category}
                        difficulty={question.difficulty}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {opts.map((opt, idx) => {
                            const hidden = opt === question.hiddenAnswer;
                            const reveal = showRes || selected === idx;

                            return (
                                <OptionButton
                                    key={idx}
                                    label={hidden && !reveal ? '?' : opt}
                                    selected={selected === idx}
                                    correct={showRes && idx === correctIdx}
                                    incorrect={showRes && selected === idx && idx !== correctIdx}
                                    disabled={
                                        switchingRound ||
                                        showRes ||
                                        currentPlayer?.id !== opponentId
                                    }
                                    onClick={() => handleClick(idx)}
                                />
                            );
                        })}
                    </div>

                    {showRes && (
                        <div
                            className={cn(
                                'flex items-center justify-center gap-3 mt-6 px-4 py-3 rounded-lg mx-auto max-w-xs animate-bounce-in',
                                selected === correctIdx
                                    ? 'bg-green-500/20 text-green-300 ring-2 ring-green-400'
                                    : 'bg-red-500/20 text-red-300 ring-2 ring-red-400',
                            )}
                        >
                            {selected === correctIdx ? (
                                <>
                                    <CheckCircle className="h-6 w-6 flex-shrink-0" />
                                    <span className="font-semibold">
                    {opponent?.name} triomphe&nbsp;!
                  </span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-6 w-6 flex-shrink-0" />
                                    <span className="font-semibold">
                    {opponent?.name} échoue…
                  </span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DuelPage;