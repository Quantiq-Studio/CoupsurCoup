import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import RoundTitle from '@/components/game/RoundTitle';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionButton from '@/components/game/OptionButton';
import { AlertCircle } from 'lucide-react';

const DuelPage: React.FC = () => {
  /* ───────── params & contexte ───────── */
  const { roomId, challengerId, opponentId } =
      useParams<{ roomId: string; challengerId: string; opponentId: string }>();
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    eliminatePlayer,
    players,
  } = useGame();

  const challenger = players.find(p => p.id === challengerId);
  const opponent   = players.find(p => p.id === opponentId);

  /* ───────── question de duel ───────── */
  const q = useMemo(() => {
    const first = questions[currentQuestionIndex];
    if (first?.type === 'duel') return first;

    // filet de sécurité : on prend la 1ʳᵉ question “duel” dispo
    return questions.find(qq => qq.type === 'duel');
  }, [questions, currentQuestionIndex]);

  if (!q) {
    return <p className="text-white p-8">Aucune question de duel disponible.</p>;
  }

  /* -------- calcul de l’index correct réel -------- */
  const opts = [...(q.options ?? [])];
  if (q.hiddenAnswer && !opts.includes(q.hiddenAnswer)) opts.push(q.hiddenAnswer);

  const effectiveCorrectIndex = (() => {
    if (q.correct === 'autre') return opts.findIndex(o => o === q.hiddenAnswer);
    if (q.correct?.startsWith('visible'))
      return parseInt(q.correct.replace('visible', ''), 10) - 1;
    return q.correctIndex ?? -1;
  })();

  /* ───────── gestion locale d’état ───────── */

  const finish = (answerIsRight: boolean) => {
    if (answerIsRight) {
      // opponent sauvé → challenger éliminé
      eliminatePlayer(challengerId!);
    } else {
      // opponent rate → opponent éliminé
      eliminatePlayer(opponentId!);
    }

    // retour à la phase sélective après 3 s
    setTimeout(() => navigate(`/round1/${roomId}`), 3000);
  };

  const handleClick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setShowResult(true);
    finish(i === effectiveCorrectIndex);
  };

  /* ───────── rendu ───────── */
  return (
      <div className="min-h-screen bg-game-gradient flex flex-col py-8">
        <RoundTitle
            roundNumber={2}
            title="Duel décisif"
            description={`${opponent?.name ?? '???'} affronte ${challenger?.name ?? '???'} !`}
        />

        <div className="mx-auto mt-8 max-w-2xl w-full bg-white/10 p-6 rounded-xl">
          <QuestionDisplay
              question={q.question}
              category={q.category}
              difficulty={q.difficulty}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {opts.map((opt, idx) => {
              const isHidden = opt === q.hiddenAnswer;
              const reveal   = showResult || selected === idx;

              return (
                  <OptionButton
                      key={idx}
                      label={isHidden && !reveal ? '?' : opt}
                      selected={selected === idx}
                      correct={showResult && idx === effectiveCorrectIndex}
                      incorrect={showResult && selected === idx && idx !== effectiveCorrectIndex}
                      disabled={showResult}
                      onClick={() => handleClick(idx)}
                  />
              );
            })}
          </div>

          {showResult && (
              <p className="text-center mt-6 text-white">
                {selected === effectiveCorrectIndex
                    ? `${opponent?.name} a triomphé !`
                    : `${opponent?.name} échoue…`}
              </p>
          )}
        </div>
      </div>
  );
};

export default DuelPage;
