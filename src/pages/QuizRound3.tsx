import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDown,
  TimerIcon,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

import { useGame }              from '@/context/GameContext';
import RoundTitle               from '@/components/game/RoundTitle';
import QuestionDisplay          from '@/components/game/QuestionDisplay';
import OptionButton             from '@/components/game/OptionButton';
import PlayerStatus             from '@/components/game/PlayerStatus';
import { GameNotification }     from '@/components/ui/game-notification';
import { Progress }             from '@/components/ui/progress';
import { useBotTurn }           from '@/hooks/useBotTurn';
import { useToast }             from '@/hooks/use-toast';
import { databases }            from '@/lib/appwrite';

/* ---------- Appwrite ---------- */
const DATABASE_ID         = '68308ece00320290574e';
const GAMES_COLLECTION_ID = '68308f180030b8019d46';

/* ================================================================ */
const QuizRound3: React.FC = () => {
  const { roomId }  = useParams<{ roomId: string }>();
  const navigate    = useNavigate();
  const { toast }   = useToast();

  /* -------- contexte ---------- */
  const {
    /* état global */
    questions,
    currentQuestionIndex, setCurrentQuestionIndex,
    players,
    currentPlayer,
    timeRemaining,        setTimeRemaining,

    /* helpers */
    addCoins,
    updatePlayerStatus,
    startDuel,

    /* ⇣ flag transition de round ⇣ */
    switchingRound,
    unlockRoundSwitch,
  } = useGame();

  /* déverrouille dès le montage */
  useEffect(() => unlockRoundSwitch(), [unlockRoundSwitch]);

  /* ------------ données ------------- */
  const currentQuestion = questions[currentQuestionIndex];
  const activePlayers   = players.filter(p => !p.isEliminated);

  /* 6 vraies + 1 fausse */
  const propositions = useMemo(
      () => currentQuestion?.propositions ?? [],
      [currentQuestion],
  );
  const trapIndex = currentQuestion?.falseIndex ?? -1;

  /* ---------- état local ----------- */
  const [activePlayerId,  setActivePlayerId ] = useState<string | null>(null);
  const [answeredIndices, setAnsweredIndices] = useState<Set<number>>(new Set());
  const [selectedIdx,     setSelectedIdx   ] = useState<number | null>(null);
  const [showRes,         setShowRes       ] = useState(false);

  const [statusNotif, setStatusNotif] = useState<{
    playerId: string; status: 'orange' | 'red';
  } | null>(null);

  /* --- init tour --- */
  useEffect(() => {
    if (activePlayers.length && !activePlayerId) {
      setActivePlayerId(activePlayers[0].id);
    }
  }, [activePlayers, activePlayerId]);

  /* ------- timer ------- */
  useEffect(() => {
    if (switchingRound || !activePlayerId || showRes) return;

    if (timeRemaining > 0) {
      const t = setTimeout(() => setTimeRemaining(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
    /* temps écoulé = erreur */
    handleSelection(trapIndex);
  }, [timeRemaining, showRes, activePlayerId, trapIndex, setTimeRemaining, switchingRound]);

  /* ---------------------------------------------------------------
   Saut automatique : si toutes les bonnes réponses sont trouvées
   --------------------------------------------------------------- */
  useEffect(() => {
    // on vérifie à chaque changement du set ou de la liste
    if (
        answeredIndices.size === propositions.length - 1 && // il ne reste que le piège
        !switchingRound &&                                  // pas de transition en cours
        !showRes                                            // pas de feedback visible
    ) {
      // petite pause visuelle facultative
      setTimeout(() => {
        // on prépare la question/liste suivante
        setAnsweredIndices(new Set());
        setSelectedIdx(null);
        setCurrentQuestionIndex(i => (i + 1) % questions.length);
        setTimeRemaining(15);
        // on conserve le même joueur actif (ou le tour suivant sera géré normalement)
      }, 800); // délai court pour que les joueurs voient que tout est validé
    }
  }, [answeredIndices, propositions.length, switchingRound, showRes,
    setCurrentQuestionIndex, setAnsweredIndices, setSelectedIdx,
    setTimeRemaining, questions.length]);

  /* ------------ clic humain / bot ------------ */
  const handleSelection = (idx: number): void => {
    if (
        switchingRound ||
        selectedIdx !== null ||
        !activePlayerId ||
        answeredIndices.has(idx)
    ) {
      return;
    }

    setSelectedIdx(idx);
    setShowRes(true);

    const isTrap = idx === trapIndex;
    if (isTrap) {
      handleWrong(activePlayerId, idx);
    } else {
      handleGood(activePlayerId, idx);   // ⬅️ on passe l’index
    }

    setTimeout(() => proceedNextTurn(isTrap), 2500);
  };

  /* ------- bonnes réponses ------- */
  const handleGood = (playerId: string, idx: number) => {
    addCoins(playerId, 100);
    setAnsweredIndices(prev => {
      const next = new Set(prev);
      next.add(idx);        // ⬅️ on ajoute vraiment l’indice validé
      return next;
    });
  };

  /* ------- mauvaises réponses ---- */
  const handleWrong = async (playerId: string, _idx: number) => {
    const curStatus  = players.find(p => p.id === playerId)?.status ?? 'green';
    const nextStatus = curStatus === 'green' ? 'orange' : 'red';

    updatePlayerStatus(playerId, nextStatus as any);
    setStatusNotif({ playerId, status: nextStatus as any });

    if (nextStatus === 'red') {
      await startDuel(playerId);
      await databases.updateDocument(
          DATABASE_ID, GAMES_COLLECTION_ID, roomId!, { round: 4 },
      ).catch(() =>
          toast({ title:'Erreur', description:'Maj round impossible', variant:'destructive' }),
      );

      navigate(`/duel-select/${roomId}/${playerId}`);
    }
  };

  /* ---------- tour suivant -------- */
  const proceedNextTurn = (wasTrap: boolean) => {
    if (switchingRound) return;

    setShowRes(false);
    setSelectedIdx(null);
    setTimeRemaining(15);

    if (wasTrap) {
      setAnsweredIndices(new Set());
      setCurrentQuestionIndex(i => (i + 1) % questions.length);
    }

    if (activePlayerId) {
      const idx = activePlayers.findIndex(p => p.id === activePlayerId);
      setActivePlayerId(activePlayers[(idx + 1) % activePlayers.length].id);
    }
  };

  /* ------------ BOT ------------- */
  const activePlayer = activePlayerId
      ? players.find(p => p.id === activePlayerId)
      : undefined;

  /* indices encore cliquables (non déjà validés) */
  const availableIndices = propositions
      .map((_, i) => i)
      .filter(i => !answeredIndices.has(i));

  useBotTurn({
    /* le bot ne joue que s’il est actif, qu’il n’y a pas de résultat à l’écran,
       qu’on n’est pas en transition… et qu’il reste au moins un choix possible */
    isBotTurn:
        !!activePlayer?.isBot &&
        !showRes &&
        !switchingRound &&
        availableIndices.length > 0,

    /* on passe la fonction answer qui pioche dans les indices restants */
    answer: () => {
      const chosen =
          availableIndices[Math.floor(Math.random() * availableIndices.length)];
      handleSelection(chosen);
    },

    /* Les trois lignes suivantes n’influent plus vraiment, on laisse par défaut */
    correctIndex: 0,
    nbOptions: availableIndices.length,
    successRate: 0.75,
    minDelayMs: 1200,
    maxDelayMs: 4000,
  });

  /* ---------- rendu ------------ */
  if (!currentQuestion) return null;

  return (
      <div className="min-h-screen bg-game-gradient flex flex-col">
        <div className="game-container flex flex-col flex-grow py-8">
          <RoundTitle
              roundNumber={3}
              title="Liste Piégée"
              description="Ne choisissez pas l'intrus !"
          />

          {/* ---- infos top ---- */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white">
              <span>Liste {currentQuestionIndex - 25 + 1}</span>
            </div>
            {activePlayer && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white">
                  <TimerIcon className="h-4 w-4" />
                  <span>{timeRemaining}s</span>
                </div>
            )}
          </div>

          {/* ---- notification ---- */}
          {statusNotif && (
              <GameNotification
                  title={statusNotif.status === 'orange' ? 'Attention !' : 'Danger !'}
                  message={
                    statusNotif.status === 'orange'
                        ? `${players.find(p=>p.id===statusNotif.playerId)?.name} écope d’un avertissement.`
                        : `${players.find(p=>p.id===statusNotif.playerId)?.name} part en duel !`
                  }
                  variant={statusNotif.status === 'orange' ? 'warning' : 'error'}
                  icon={statusNotif.status === 'orange' ? AlertTriangle : AlertCircle}
                  className="mb-4 animate-bounce-in"
              />
          )}

          {/* ---- joueur actif ---- */}
          {activePlayer && (
              <div className="mb-6 animate-fade-in">
                <h3 className="text-center text-lg mb-2 text-white">Au tour de</h3>
                <div className="max-w-xs mx-auto">
                  <PlayerStatus player={activePlayer} status={activePlayer.status} isActive showCoins />
                </div>
              </div>
          )}

          {/* ---- question ---- */}
          <QuestionDisplay
              question={currentQuestion.question}
              category={currentQuestion.category}
              difficulty={currentQuestion.difficulty}
          />

          {/* =========================================================
             GRID principal : propositions (gauche) / statuts (droite)
           ========================================================= */}
          <div className="mt-8 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="md:col-span-2 lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {propositions.map((prop, idx) => {
                  const already      = answeredIndices.has(idx);          // trouvée correcte auparavant
                  const isSelected   = idx === selectedIdx;               // choix en cours
                  const reveal       = already || isSelected;             // on ne révèle QUE celle-ci
                  const isTrapSel    = isSelected && idx === trapIndex;   // piège cliqué
                  const isGoodSel    = isSelected && idx !== trapIndex;   // bonne réponse cliquée

                  return (
                      <OptionButton
                          key={idx}
                          label={prop}
                          revealed={reveal}
                          selected={isSelected}
                          correct={reveal && idx !== trapIndex}
                          incorrect={isTrapSel}
                          disabled={
                              switchingRound ||
                              showRes            ||
                              already            ||   // (= answeredIndices.has(idx))
                              activePlayer?.id !== currentPlayer?.id ||
                              currentPlayer?.isBot
                          }
                          onClick={() => handleSelection(idx)}
                      />
                  );
                })}
              </div>

              {/* feedback sous les propositions (inchangé) */}
              {showRes && (
                  <div className="text-center mt-6 animate-bounce-in">
                    {selectedIdx === trapIndex ? (
                        <p className="text-xl font-bold text-red-400">Mauvaise réponse !</p>
                    ) : (
                        <p className="text-xl font-bold text-green-400">Bonne réponse !</p>
                    )}
                  </div>
              )}
            </div>

            <div className="md:col-span-1 space-y-3">
              <h3 className="text-lg font-bold flex items-center text-white mb-2">
                Statut <ArrowDown className="ml-1 h-4 w-4" />
              </h3>

              {activePlayers.map(p => (
                  <PlayerStatus
                      key={p.id}
                      player={p}
                      isActive={p.id === activePlayerId}
                      status={p.status || 'green'}
                      coinChange={p.coins || 0}
                      compact
                  />
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default QuizRound3;
