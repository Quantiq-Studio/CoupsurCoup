import React, {useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useGame} from '@/context/GameContext';
import RoundTitle from '@/components/game/RoundTitle';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionButton from '@/components/game/OptionButton';
import PlayerStatus from '@/components/game/PlayerStatus';
import {useBotTurn} from '@/hooks/useBotTurn';
import {ArrowLeft} from 'lucide-react';
import {GameButton} from '@/components/ui/game-button';

/* ------------------------------------------------------------------ */
const DuelPage: React.FC = () => {
    const {roomId, challengerId, opponentId} =
        useParams<{ roomId: string; challengerId: string; opponentId: string }>();

    const navigate = useNavigate();
    const {
        questions,
        eliminatePlayer,
        players,
        setCurrentRound,
        setGameMode,
    } = useGame();

    const challenger = players.find(p => p.id === challengerId);
    const opponent = players.find(p => p.id === opponentId);

    /* -------  Étape 1 : choix du thème  ---------------------------- */
    const duelQuestions = useMemo(
        () => questions.filter(q => q.type === 'duel'),
        [questions]
    );

    // on tire 2 thèmes distincts (sécurités incluses)
    const [qA, qB] = duelQuestions.slice(0, 2);
    const [chosen, setChosen] = useState<'A' | 'B' | null>(null);
    const question = chosen === 'A' ? qA : chosen === 'B' ? qB : undefined;

    /* ----------------- BOT choisit le thème ------------------------ */
    useBotTurn({
        isBotTurn: !!opponent?.isBot && !chosen,
        answer: idx => setChosen(idx === 0 ? 'A' : 'B'),
        //
        // Comme il n’y a “pas” de bonne réponse, on tire un index au hasard
        // et on force successRate à 1, ce qui revient à “choisir idx” après délai.
        //
        correctIndex: Math.floor(Math.random() * 2),
        nbOptions: 2,
        successRate: 1,
        minDelayMs: 2000,
        maxDelayMs: 5000,
    });

    /* ----------------- Étape 2 : répondre -------------------------- */
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const opts = useMemo(() => {
        if (!question) return [];
        const base = [...(question.options ?? [])];
        if (question.hiddenAnswer && !base.includes(question.hiddenAnswer))
            base.push(question.hiddenAnswer);
        return base;
    }, [question]);

    const correctIndex = useMemo(() => {
        if (!question) return -1;
        if (question.correct === 'autre')
            return opts.findIndex(o => o === question.hiddenAnswer);
        if (question.correct?.startsWith('visible'))
            return parseInt(question.correct.replace('visible', ''), 10) - 1;
        return question.correctIndex ?? -1;
    }, [question, opts]);

    /* BOT répond */
    useBotTurn({
        isBotTurn: !!opponent?.isBot && !!question && !showResult,
        answer: i => handleClick(i),
        correctIndex,
        nbOptions: opts.length,
        successRate: 0.6,
        minDelayMs: 1500,
        maxDelayMs: 4000,
    });

    /* ---------------- outcome ----------------- */
    const finish = (answerIsRight: boolean) => {
        if (answerIsRight) eliminatePlayer(challengerId!);
        else eliminatePlayer(opponentId!);

        // on revient à la phase sélective (round1) après 2 s
        setTimeout(() => {
            setCurrentRound(1);
            setGameMode('phase_selective');
            navigate(`/round1/${roomId}`);
        }, 2000);
    };

    const handleClick = (i: number) => {
        if (selected !== null || !question) return;
        setSelected(i);
        setShowResult(true);
        finish(i === correctIndex);
    };

    /* --------------------------- UI ------------------------------- */
    if (!qA || !qB) return (
        <p className="text-white p-8">Aucune question de duel disponible.</p>
    );

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

            {/* --- Challenger / Opponent en haut --------------------------- */}
            <div className="flex justify-center gap-8 mb-6">
                <PlayerStatus player={challenger!} isActive showCoins/>
                <span className="text-2xl text-white font-bold">VS</span>
                <PlayerStatus player={opponent!} isActive showCoins/>
            </div>

            {/* =====================  PHASE CHOIX THEME  =================== */}
            {!chosen && (
                <div className="mx-auto w-full max-w-lg bg-white/10 p-6 rounded-xl animate-bounce-in">
                    <h3 className="text-center text-white mb-6">Choisis ton thème</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[qA, qB].map((q, idx) => (
                            <GameButton
                                key={idx}
                                variant="secondary"
                                onClick={() => setChosen(idx === 0 ? 'A' : 'B')}
                                disabled={
                                    !!opponent?.isBot ||
                                    opponent?.id !== challengerId &&
                                    opponent?.id !== players.find(p => p.id === challengerId)?.id
                                }
                            >
                                {q.theme ?? q.category}
                            </GameButton>
                        ))}
                    </div>
                </div>
            )}

            {/* =====================  PHASE QUESTION  ====================== */}
            {question && (
                <div className="mx-auto mt-8 max-w-2xl w-full bg-white/10 p-6 rounded-xl animate-fade-in-slow">
                    <QuestionDisplay
                        question={question.question}
                        category={question.category}
                        difficulty={question.difficulty}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        {opts.map((opt, idx) => {
                            const hidden = opt === question.hiddenAnswer;
                            const reveal = showResult || selected === idx;
                            return (
                                <OptionButton
                                    key={idx}
                                    label={hidden && !reveal ? '?' : opt}
                                    selected={selected === idx}
                                    correct={showResult && idx === correctIndex}
                                    incorrect={
                                        showResult && selected === idx && idx !== correctIndex
                                    }
                                    disabled={showResult}
                                    onClick={() => handleClick(idx)}
                                />
                            );
                        })}
                    </div>

                    {showResult && (
                        <p className="text-center mt-6 text-white">
                            {selected === correctIndex
                                ? `${opponent?.name} triomphe !`
                                : `${opponent?.name} échoue…`}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DuelPage;