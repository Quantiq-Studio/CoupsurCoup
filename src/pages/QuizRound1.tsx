import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Progress } from '@/components/ui/progress';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionButton from '@/components/game/OptionButton';
import RoundTitle from '@/components/game/RoundTitle';
import PlayerStatus from '@/components/game/PlayerStatus';
import { GameNotification } from '@/components/ui/game-notification';
import { TimerIcon, AlertTriangle, AlertCircle, ArrowDown } from 'lucide-react';
import { Player } from '@/context/GameTypes';
import { useToast } from '@/hooks/use-toast';
import { useBotTurn } from '@/hooks/useBotTurn';     // <-- nouveau hook

/* ------------------------------------------------------------------ */

const QuizRound1: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roomId } = useParams<{ roomId: string }>();

  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    players,
    timeRemaining,
    setTimeRemaining,
    currentPlayer,
    addCoins,
    startDuel,
      updatePlayerStatus
  } = useGame();

  /* ----------------------- State locaux ----------------------- */
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult]         = useState(false);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const [playerStatuses, setPlayerStatuses] = useState<
      Record<string, 'green' | 'orange' | 'red'>
  >({});
  const [coinChanges, setCoinChanges] = useState<Record<string, number>>({});
  const [showStatusNotif, setShowStatusNotif] = useState<{
    playerId: string;
    status: 'orange' | 'red';
  } | null>(null);

  /* ------------------------------------------------------------- */
  const currentQuestion = questions[currentQuestionIndex];
  const activePlayers   = players.filter(p => !p.isEliminated);

  /* ---------- options visibles (avec « ? » si réponse cachée) --- */
  const opts = useMemo<string[]>(() => {
    if (!currentQuestion) return [];
    const base = [...(currentQuestion.options ?? [])];

    if (currentQuestion.hiddenAnswer && !base.includes(currentQuestion.hiddenAnswer)) {
      base.push(currentQuestion.hiddenAnswer); // on la pousse pour pouvoir l'afficher
    }
    return base;
  }, [currentQuestion]);

  /* ---------------- index correct réel (tous modes) ------------- */
  const effectiveCorrectIndex = useMemo(() => {
    if (!currentQuestion) return -1;

    if (currentQuestion.correct === 'autre') {
      return opts.findIndex(o => o === currentQuestion.hiddenAnswer);
    }
    if (currentQuestion.correct?.startsWith('visible')) {
      const n = parseInt(currentQuestion.correct.replace('visible', ''), 10);
      return Number.isNaN(n) ? -1 : n - 1;
    }
    if (currentQuestion.correctIndex != null) return currentQuestion.correctIndex;
    return -1;
  }, [currentQuestion, opts]);

  /* --------------------- Init tour de table --------------------- */
  useEffect(() => {
    if (activePlayers.length && !Object.keys(playerStatuses).length) {
      const init: Record<string, 'green'> = {};
      activePlayers.forEach(p => (init[p.id] = 'green'));
      setPlayerStatuses(init);
      setActivePlayerId(activePlayers[0].id);
    }
  }, [activePlayers, playerStatuses]);

  /* ------------------------- Timer ------------------------------ */
  useEffect(() => {
    if (showResult || !activePlayerId) return;
    if (timeRemaining > 0) {
      const t = setTimeout(() => setTimeRemaining(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
    handleTimeUp();
  }, [timeRemaining, showResult, activePlayerId, setTimeRemaining]);

  const handleTimeUp = () => {
    setShowResult(true);
    if (activePlayerId) {
      updatePlayerCoins(activePlayerId, -50, 'Temps écoulé');
      updatePlayerStatusLocal(activePlayerId);
    }
    setTimeout(moveToNextPlayer, 3000);
  };

  /* ------------------------- Sélection --------------------------- */
  const handleOptionSelect = (index: number) => {
    if (showResult || selectedOption != null || !activePlayerId) return;
    setSelectedOption(index);
    setShowResult(true);

    if (index === effectiveCorrectIndex) {
      updatePlayerCoins(activePlayerId, 100, 'Bonne réponse');
    } else {
      updatePlayerStatusLocal(activePlayerId);
      updatePlayerCoins(activePlayerId, -75, 'Mauvaise réponse');
    }

    setTimeout(moveToNextPlayer, 3000);
  };

  /* -------------------- Simulation bot -------------------------- */
  const activePlayer = activePlayerId
      ? players.find(p => p.id === activePlayerId)
      : undefined;

  useBotTurn({
    isBotTurn:
        !!activePlayer?.isBot &&
        !showResult &&
        effectiveCorrectIndex >= 0 &&
        opts.length > 0,
    answer: handleOptionSelect,
    correctIndex: effectiveCorrectIndex,
    nbOptions: opts.length,
    successRate: 0.2,
    minDelayMs: 1000,
    maxDelayMs: 6000,
  });

  /* -------------------- Helpers joueurs ------------------------- */
  const updatePlayerCoins = (id: string, amount: number, _reason: string) => {
    addCoins(id, amount);
    setCoinChanges(prev => ({ ...prev, [id]: amount }));
    setTimeout(() => setCoinChanges(prev => ({ ...prev, [id]: 0 })), 2000);
  };

  const updatePlayerStatusLocal = async (id: string) => {
    const current = playerStatuses[id] ?? 'green';
    const next    = current === 'green' ? 'orange' : 'red';

    /* mise à jour locale – pour l’UI du round */
    setPlayerStatuses(prev => ({ ...prev, [id]: next }));
    setShowStatusNotif({ playerId: id, status: next });

    /* propagation globale → visible dans les autres pages */
    updatePlayerStatus(id, next);

    if (next === 'red') {
      await startDuel(id);
      navigate(`/duel-select/${roomId}/${id}`);
    }
  };

  const moveToNextPlayer = () => {
    setShowStatusNotif(null);
    setSelectedOption(null);
    setShowResult(false);
    setTimeRemaining(10);

    setCurrentQuestionIndex(i => (i + 1) % questions.length);

    if (activePlayerId) {
      const idx = activePlayers.findIndex(p => p.id === activePlayerId);
      setActivePlayerId(activePlayers[(idx + 1) % activePlayers.length].id);
    }
  };


  /* -------------------------- UI -------------------------------- */
  const renderStatusNotif = () => {
    if (!showStatusNotif) return null;
    const p = players.find(pl => pl.id === showStatusNotif.playerId);
    if (!p) return null;
    return (
        <div className="mb-4 animate-bounce-in">
          <GameNotification
              title={showStatusNotif.status === 'orange' ? 'Attention !' : 'Danger !'}
              message={
                showStatusNotif.status === 'orange'
                    ? `${p.name} est en alerte, encore une erreur et c'est le duel !`
                    : `${p.name} est en danger ! Duel imminent !`
              }
              variant={showStatusNotif.status === 'orange' ? 'warning' : 'error'}
              icon={showStatusNotif.status === 'orange' ? AlertTriangle : AlertCircle}
          />
        </div>
    );
  };

  /* -------------------------------------------------------------- */
  return (
      <div className="min-h-screen bg-game-gradient flex flex-col">
        <div className="game-container flex flex-col flex-grow py-8">
          <RoundTitle
              roundNumber={1}
              title="Phase Sélective"
              description="Répondez correctement pour rester dans la course! Deux erreurs vous mènent au Duel Décisif."
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white">
              <span>Question {currentQuestionIndex + 1}</span>
            </div>

            {activePlayer && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white">
                  <TimerIcon className="h-4 w-4" />
                  <span>{timeRemaining}s</span>
                </div>
            )}
          </div>

          {renderStatusNotif()}

          {activePlayer && (
              <div className="mb-6 animate-fade-in">
                <h3 className="text-center text-lg mb-2 text-white">Au tour de</h3>
                <div className="max-w-xs mx-auto">
                  <PlayerStatus
                      player={activePlayer}
                      isActive
                      showCoins
                      coinChange={coinChanges[activePlayer.id] || 0}
                      status={activePlayer.status || 'green'}
                  />
                </div>
              </div>
          )}

          <Progress value={(timeRemaining / 10) * 100} className="h-2 mb-8" />

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 animate-zoom-in">
            {currentQuestion && (
                <QuestionDisplay
                    question={currentQuestion.question}
                    category={currentQuestion.category || ''}
                    difficulty={currentQuestion.difficulty || 'moyen'}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {opts.map((opt, idx) => {
                const hidden   = opt === currentQuestion?.hiddenAnswer;
                const revealed = showResult || selectedOption === idx;

                return (
                    <OptionButton
                        key={idx}
                        label={hidden && !revealed ? '?' : opt}
                        isHidden={hidden}
                        revealed={revealed}
                        selected={selectedOption === idx}
                        correct={showResult && idx === effectiveCorrectIndex}
                        incorrect={showResult && selectedOption === idx && idx !== effectiveCorrectIndex}
                        disabled={
                            showResult ||
                            activePlayer?.id !== currentPlayer?.id ||
                            currentPlayer?.isBot
                        }
                        onClick={() => handleOptionSelect(idx)}
                    />
                );
              })}
            </div>

            {showResult && (
                <div className="mt-6 text-center animate-bounce-in">
                  {selectedOption === effectiveCorrectIndex ? (
                      <p className="text-xl font-bold text-green-400">Bonne réponse !</p>
                  ) : (
                      <p className="text-xl font-bold text-red-400">
                        {selectedOption != null ? 'Mauvaise réponse !' : 'Temps écoulé !'}
                      </p>
                  )}
                  {selectedOption != null && (
                      <p className="mt-2 text-white">
                        La bonne réponse était : {opts[effectiveCorrectIndex]}
                      </p>
                  )}
                </div>
            )}
          </div>

          <div className="mt-auto">
            <h3 className="text-lg font-bold mb-2 flex items-center text-white">
              Statut des joueurs <ArrowDown className="ml-2 h-4 w-4" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activePlayers.map(p => (
                  <PlayerStatus
                      key={p.id}
                      player={p}
                      isActive={p.id === activePlayerId}
                      status={playerStatuses[p.id] || 'green'}
                      coinChange={coinChanges[p.id] || 0}
                      compact
                  />
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default QuizRound1;
