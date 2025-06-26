import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TimerIcon,
  AlertTriangle,
  AlertCircle,
  ArrowDown,
} from 'lucide-react';

import { useGame }           from '@/context/GameContext';
import { Progress }          from '@/components/ui/progress';
import RoundTitle            from '@/components/game/RoundTitle';
import QuestionDisplay       from '@/components/game/QuestionDisplay';
import OptionButton          from '@/components/game/OptionButton';
import PlayerStatus          from '@/components/game/PlayerStatus';
import { GameNotification }  from '@/components/ui/game-notification';
import { useBotTurn }        from '@/hooks/useBotTurn';
import { useToast }          from '@/hooks/use-toast';
import { databases }         from '@/lib/appwrite';
import {useGameRealtime} from "@/hooks/useGameRealtime.ts";

/* ------------------------------------------------------------------ */
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const GAMES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_GAMES_COLLECTION_ID;

/* ------------------------------------------------------------------ */
const QuizRound1: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  useGameRealtime(roomId)
  const navigate    = useNavigate();
  const { toast }   = useToast();

  /* ---------------------- contexte ---------------------- */
  const {
    /* état global jeu ------------------------------------ */
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    players,
    currentPlayer,

    /* timer ---------------------------------------------- */
    timeRemaining,
    setTimeRemaining,

    /* helpers -------------------------------------------- */
    addCoins,
    updatePlayerStatus,
    startDuel,

    /* gestion round -------------------------------------- */
    switchingRound,
    unlockRoundSwitch,
  } = useGame();

  /* déverrouille la protection de navigation au montage */
  useEffect(() => unlockRoundSwitch(), []);

  /* ------------------- state locaux -------------------- */
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult,     setShowResult]     = useState(false);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const [localStatuses, setLocalStatuses] = useState<
      Record<string, 'green' | 'orange' | 'red'>
  >({});
  const [coinChanges, setCoinChanges] = useState<Record<string, number>>({});
  const [statusNotif, setStatusNotif] = useState<{
    playerId: string; status: 'orange' | 'red';
  } | null>(null);

  /* -------------------- calculs ------------------------ */
  const currentQuestion = questions[currentQuestionIndex];
  const activePlayers   = players.filter(p => !p.isEliminated);

  const opts = useMemo(() => {
    if (!currentQuestion) return [];
    const base = [...(currentQuestion.options ?? [])];
    if (currentQuestion.hiddenAnswer && !base.includes(currentQuestion.hiddenAnswer)) {
      base.push(currentQuestion.hiddenAnswer);
    }
    return base;
  }, [currentQuestion]);

  const correctIdx = useMemo(() => {
    if (!currentQuestion) return -1;
    if (currentQuestion.correct === 'autre') {
      return opts.findIndex(o => o === currentQuestion.hiddenAnswer);
    }
    if (currentQuestion.correct?.startsWith('visible')) {
      const n = parseInt(currentQuestion.correct.replace('visible', ''), 10);
      return Number.isNaN(n) ? -1 : n - 1;
    }
    return currentQuestion.correctIndex ?? -1;
  }, [currentQuestion, opts]);

  /* -------------------- init tour ---------------------- */
  useEffect(() => {
    if (activePlayers.length && !activePlayerId) {
      setActivePlayerId(activePlayers[0].id);

      if (!Object.keys(localStatuses).length) {
        const init: Record<string, 'green'> = {};
        activePlayers.forEach(p => (init[p.id] = 'green'));
        setLocalStatuses(init);
      }
    }
  }, [activePlayers, activePlayerId, localStatuses]);

  /* -------------------- timer -------------------------- */
  useEffect(() => {
    if (showResult || !activePlayerId) return;
    if (timeRemaining > 0) {
      const t = setTimeout(() => setTimeRemaining(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
    onTimeUp();
  }, [timeRemaining, showResult, activePlayerId, setTimeRemaining]);

  const onTimeUp = () => {
    setShowResult(true);
    if (activePlayerId) {
      changeCoins(activePlayerId, -50);
      penalise(activePlayerId);
    }
    setTimeout(nextTurn, 3000);
  };

  /* ---------------- sélection -------------------------- */
  const onSelect = (idx: number) => {
    if (showResult || selectedOption !== null || !activePlayerId) return;

    setSelectedOption(idx);
    setShowResult(true);

    if (idx === correctIdx) {
      changeCoins(activePlayerId, 100);
    } else {
      penalise(activePlayerId);
      changeCoins(activePlayerId, -75);
    }
    setTimeout(nextTurn, 3000);
  };

  /* ------------------- bot ----------------------------- */
  const activePlayer = activePlayerId
      ? players.find(p => p.id === activePlayerId)
      : undefined;

  useBotTurn({
    isBotTurn:
        !!activePlayer?.isBot && !showResult && correctIdx >= 0 && opts.length > 0,
    answer: onSelect,
    correctIndex: correctIdx,
    nbOptions: opts.length,
    successRate: 0.2,
    minDelayMs: 1000,
    maxDelayMs: 6000,
  });

  /* ---------------- helpers --------------------------- */
  const changeCoins = (id: string, delta: number) => {
    addCoins(id, delta);
    setCoinChanges(prev => ({ ...prev, [id]: delta }));
    setTimeout(() => setCoinChanges(prev => ({ ...prev, [id]: 0 })), 2000);
  };

  const penalise = async (id: string) => {
    const cur = localStatuses[id] ?? 'green';
    const next = cur === 'green' ? 'orange' : 'red';

    setLocalStatuses(prev => ({ ...prev, [id]: next }));
    setStatusNotif({ playerId: id, status: next });
    updatePlayerStatus(id, next);

    if (next === 'red') {
      await startDuel(id);
      try {
        await databases.updateDocument(
            DATABASE_ID,
            GAMES_COLLECTION_ID,
            roomId!,
            { round: 2 }
        );
      } catch {
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour le round du jeu.',
          variant: 'destructive',
        });
      }
      navigate(`/duel-select/${roomId}/${id}`);
    }
  };

  /* --------------- tour suivant ----------------------- */
  const nextTurn = () => {
    if (switchingRound) return;          // blocage pendant transition

    setStatusNotif(null);
    setSelectedOption(null);
    setShowResult(false);
    setTimeRemaining(10);

    setCurrentQuestionIndex(i => (i + 1) % questions.length);

    if (activePlayerId) {
      const pos = activePlayers.findIndex(p => p.id === activePlayerId);
      setActivePlayerId(activePlayers[(pos + 1) % activePlayers.length].id);
    }
  };

  /* ------------------- UI helpers --------------------- */
  const renderNotif = () => {
    if (!statusNotif) return null;
    const pl = players.find(p => p.id === statusNotif.playerId);
    if (!pl) return null;

    return (
        <div className="mb-4 animate-bounce-in">
          <GameNotification
              title={statusNotif.status === 'orange' ? 'Attention !' : 'Danger !'}
              message={
                statusNotif.status === 'orange'
                    ? `${pl.name} reçoit un avertissement.`
                    : `${pl.name} part en duel !`
              }
              variant={statusNotif.status === 'orange' ? 'warning' : 'error'}
              icon={statusNotif.status === 'orange' ? AlertTriangle : AlertCircle}
          />
        </div>
    );
  };

  /* -------------------- render ------------------------ */
  return (
      <div className="min-h-screen bg-game-gradient flex flex-col">
        <div className="game-container flex flex-col flex-grow py-8">
          <RoundTitle
              roundNumber={1}
              title="Phase Sélective"
              description="Répondez correctement pour rester dans la course ! Deux erreurs vous envoient en duel."
          />

          {/* bandeau question / timer */}
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

          {renderNotif()}

          {/* joueur actif */}
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

          {/* question + options */}
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
                        correct={showResult && idx === correctIdx}
                        incorrect={showResult && selectedOption === idx && idx !== correctIdx}
                        disabled={
                            showResult ||
                            activePlayer?.id !== currentPlayer?.id ||
                            currentPlayer?.isBot
                        }
                        onClick={() => onSelect(idx)}
                    />
                );
              })}
            </div>

            {showResult && (
                <div className="mt-6 text-center animate-bounce-in">
                  {selectedOption === correctIdx ? (
                      <p className="text-xl font-bold text-green-400">Bonne réponse !</p>
                  ) : (
                      <p className="text-xl font-bold text-red-400">
                        {selectedOption != null ? 'Mauvaise réponse !' : 'Temps écoulé !'}
                      </p>
                  )}
                  {selectedOption != null && (
                      <p className="mt-2 text-white">
                        La bonne réponse était : {opts[correctIdx]}
                      </p>
                  )}
                </div>
            )}
          </div>

          {/* statut joueurs */}
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
                      status={localStatuses[p.id] || 'green'}
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
