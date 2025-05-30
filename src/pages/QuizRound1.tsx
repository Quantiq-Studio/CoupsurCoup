import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { GameButton } from '@/components/ui/game-button';
import { Progress } from '@/components/ui/progress';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionButton from '@/components/game/OptionButton';
import RoundTitle from '@/components/game/RoundTitle';
import PlayerStatus from '@/components/game/PlayerStatus';
import { GameNotification } from '@/components/ui/game-notification';
import { TimerIcon, AlertCircle, ArrowDown, AlertTriangle } from 'lucide-react';
import { CoinCounter } from '@/components/ui/coin-counter';
import { Player } from '@/context/GameTypes';
import { useToast } from '@/hooks/use-toast';

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
    addCoins
  } = useGame();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [countdownMessage, setCountdownMessage] = useState('');
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [playerStatuses, setPlayerStatuses] = useState<Record<string, 'green' | 'orange' | 'red'>>({});
  const [coinChanges, setCoinChanges] = useState<Record<string, number>>({});
  const [showDuelNotification, setShowDuelNotification] = useState(false);
  const [duelPlayerId, setDuelPlayerId] = useState<string | null>(null);
  // État pour l’adversaire choisi
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(null);
  const [showStatusChangeNotification, setShowStatusChangeNotification] = useState<{playerId: string, status: 'orange' | 'red'} | null>(null);
  const [roundTransitionCountdown, setRoundTransitionCountdown] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  /* ---------- construction de la liste d’options affichée ---------- */
  const opts = useMemo<string[]>(() => {
    if (!currentQuestion) return [];
    const base = [...(currentQuestion.options ?? [])];
    if (
        currentQuestion.hiddenAnswer &&
        !base.includes(currentQuestion.hiddenAnswer)
    ) {
      base.push(currentQuestion.hiddenAnswer); // « ? » sera ajouté en dernier
    }
    return base;
  }, [currentQuestion]);

  /* ---------- index correct réel dans ce tableau ------------------- */
  const effectiveCorrectIndex = useMemo(() => {
    if (!currentQuestion) return -1;

    // 1️⃣  Cas "autre": la bonne réponse est la cachée
    if (currentQuestion.correct === 'autre') {
      return opts.findIndex(o => o === currentQuestion.hiddenAnswer);
    }

    // 2️⃣  Cas "visibleX": on déduit l’index (visible1 → 0, visible2 → 1…)
    if (currentQuestion.correct?.startsWith('visible')) {
      const n = parseInt(currentQuestion.correct.replace('visible', ''), 10);
      if (!Number.isNaN(n)) return n - 1; // visible1 => 0
    }

    // 3️⃣  Indice numérique direct
    if (currentQuestion.correctIndex !== undefined && currentQuestion.correctIndex !== null) {
      return Number(currentQuestion.correctIndex);
    }

    return -1; // Défaut / sécurité
  }, [currentQuestion, opts]);

  useEffect(() => {
    console.debug('[DEBUG] opts:', opts);
    console.debug('[DEBUG] effectiveCorrectIndex:', effectiveCorrectIndex);
    if (currentQuestion) {
      console.debug('[DEBUG] currentQuestion.correct:', currentQuestion.correct, 'correctIndex:', currentQuestion.correctIndex, 'hiddenAnswer:', currentQuestion.hiddenAnswer);
    }
  }, [opts, effectiveCorrectIndex, currentQuestion]);

  const activePlayers = players.filter(p => !p.isEliminated);

  // Initialize player statuses
  useEffect(() => {
    if (activePlayers.length > 0 && Object.keys(playerStatuses).length === 0) {
      const initialStatuses: Record<string, 'green' | 'orange' | 'red'> = {};
      activePlayers.forEach(player => {
        initialStatuses[player.id] = 'green';
      });
      setPlayerStatuses(initialStatuses);

      // Set first player as active
      setActivePlayerId(activePlayers[0].id);
    }
  }, [activePlayers, playerStatuses]);

  // Timer logic
  useEffect(() => {
    if (showResult || roundComplete || !activePlayerId || roundTransitionCountdown !== null) return;

    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up!
      handleTimeUp();
    }
  }, [timeRemaining, showResult, roundComplete, activePlayerId, setTimeRemaining, roundTransitionCountdown]);

  // Handle time up (no answer selected)
  const handleTimeUp = () => {
    setShowResult(true);

    if (activePlayerId) {
      // Player loses coins for not answering
      const coinLoss = -50;
      updatePlayerCoins(activePlayerId, coinLoss, 'Temps écoulé');

      // Update player status
      updatePlayerStatus(activePlayerId);
    }

    // Move to next player after delay
    setTimeout(() => {
      moveToNextPlayer();
    }, 3000);
  };

  useEffect(() => {
    if (activePlayer?.isBot && !showResult && !roundComplete && !roundTransitionCountdown) {
      simulateBotTurn();
    }
  }, [activePlayerId, showResult, roundComplete, roundTransitionCountdown]);

  const simulateBotTurn = () => {
    if (!activePlayer || !activePlayer.isBot || !currentQuestion) return;

    const successRate = 0.2; // 70 % de chance de bonne réponse
    const willSucceed = Math.random() < successRate;

    const answerIndex = willSucceed
      ? effectiveCorrectIndex
          : getRandomIncorrectOption(effectiveCorrectIndex, opts.length);

    // Petite pause pour simuler une réflexion
    setTimeout(() => {
      handleOptionSelect(answerIndex);
    }, 1500);
  };

  const getRandomIncorrectOption = (correct: number, totalOptions: number): number => {
    let incorrect;
    do {
      incorrect = Math.floor(Math.random() * totalOptions);
    } while (incorrect === correct);
    return incorrect;
  };

  // Update player status (green -> orange -> red)
  const updatePlayerStatus = (playerId: string) => {
    setPlayerStatuses(prev => {
      const currentStatus = prev[playerId] || 'green';
      let newStatus: 'green' | 'orange' | 'red' = currentStatus;

      if (currentStatus === 'green') {
        newStatus = 'orange';

        // Show notification for status change to orange
        setShowStatusChangeNotification({playerId, status: 'orange'});

      } else if (currentStatus === 'orange') {
        newStatus = 'red';

        // Show notification for status change to red
        setShowStatusChangeNotification({playerId, status: 'red'});

        // on navigue immédiatement vers la page de sélection
        navigate(`/duel-select/${roomId}/${playerId}`);
      }

      return { ...prev, [playerId]: newStatus };
    });
  };

  // Update player coins and track changes for animation
  const updatePlayerCoins = (playerId: string, amount: number, reason: string) => {
    addCoins(playerId, amount);
    setCoinChanges(prev => ({ ...prev, [playerId]: amount }));

    // Reset coin change animation after delay
    setTimeout(() => {
      setCoinChanges(prev => ({ ...prev, [playerId]: 0 }));
    }, 2000);
  };

  // Move to next player
  const moveToNextPlayer = () => {
    // Reset status change notification
    setShowStatusChangeNotification(null);

    setSelectedOption(null);
    setShowResult(false);
    setTimeRemaining(10); // Reset timer

    // If we need to show duel notification, don't move to next player yet
    if (showDuelNotification) {
      return;
    }

    // Move to next question
    setCurrentQuestionIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= questions.length) {
        console.warn("Plus de questions disponibles !");
        return prev; // ou même 0 si tu veux reboucler
      }
      return nextIndex;
    });

    // Find next active player
    if (activePlayerId) {
      const currentIndex = activePlayers.findIndex(p => p.id === activePlayerId);
      const nextIndex = (currentIndex + 1) % activePlayers.length;
      setActivePlayerId(activePlayers[nextIndex].id);
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    console.debug('[DEBUG] handleOptionSelect -> optionIndex:', optionIndex, 'effectiveCorrectIndex:', effectiveCorrectIndex, 'label:', opts[optionIndex]);
    if (showResult || selectedOption !== null || !activePlayerId) return;

    setSelectedOption(optionIndex);
    setShowResult(true);

    if (optionIndex === effectiveCorrectIndex) {
      // Award coins
      const coinGain = 100;
      updatePlayerCoins(activePlayerId, coinGain, 'Bonne réponse');
    } else {
      // Wrong answer
      updatePlayerStatus(activePlayerId);

      // Lose coins
      const coinLoss = -75;
      updatePlayerCoins(activePlayerId, coinLoss, 'Mauvaise réponse');
    }

    // Move to next player after delay
    setTimeout(() => {
      moveToNextPlayer();
    }, 3000);
  };

  // Get player by ID
  const getPlayerById = (id: string): Player | undefined => {
    return players.find(p => p.id === id);
  };

  // Get active player
  const activePlayer = activePlayerId ? getPlayerById(activePlayerId) : null;

  // Display status change notification
  const renderStatusChangeNotification = () => {
    if (!showStatusChangeNotification) return null;

    const { playerId, status } = showStatusChangeNotification;
    const player = getPlayerById(playerId);

    if (!player) return null;

    const title = status === 'orange' ? 'Attention !' : 'Danger !';
    const message = status === 'orange'
      ? `${player.name} est maintenant en alerte. Encore une erreur et c'est le duel !`
      : `${player.name} est en danger ! Duel imminent !`;

    return (
      <div className="mb-4 animate-bounce-in">
        <GameNotification
          title={title}
          message={message}
          variant={status === 'orange' ? 'warning' : 'error'}
          icon={status === 'orange' ? AlertTriangle : AlertCircle}
        />
      </div>
    );
  };

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

          {activePlayer && roundTransitionCountdown === null && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white">
              <TimerIcon className="h-4 w-4" />
              <span>{timeRemaining}s</span>
            </div>
          )}
        </div>

        {renderStatusChangeNotification()}

        {!showDuelNotification && roundTransitionCountdown === null && (
          <>
            {activePlayer && (
              <div className="mb-6 animate-fade-in">
                <h3 className="text-center text-lg mb-2 text-white">Au tour de</h3>
                <div className="max-w-xs mx-auto">
                  <PlayerStatus
                    player={activePlayer}
                    isActive={true}
                    showCoins={true}
                    coinChange={coinChanges[activePlayer.id] || 0}
                    status={playerStatuses[activePlayer.id] || 'green'}
                  />
                </div>
              </div>
            )}

            <Progress
              value={(timeRemaining / 10) * 100}
              className="h-2 mb-8"
            />

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 animate-zoom-in">
              {currentQuestion && !showDuelNotification && (
                <QuestionDisplay
                  question={currentQuestion.question}
                  category={currentQuestion.category || ''}
                  difficulty={currentQuestion.difficulty || 'moyen'}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {opts.map((option, index) => {
                  const isHidden  = option === currentQuestion?.hiddenAnswer;
                  const revealed  = showResult || selectedOption === index;   // révélation globale après résultat

                  return (
                      <OptionButton
                          key={index}
                          label={isHidden && !revealed ? "?" : option}
                          isHidden={isHidden}
                          revealed={revealed}
                          selected={selectedOption === index}
                          correct={showResult && index === effectiveCorrectIndex}
                          incorrect={showResult && selectedOption === index && index !== effectiveCorrectIndex}
                          disabled={
                              showResult ||
                              showDuelNotification ||
                              activePlayer?.id !== currentPlayer?.id ||
                              currentPlayer?.isBot
                          }
                          onClick={() => handleOptionSelect(index)}
                      />
                  );
                })}
              </div>

              {showResult && !showDuelNotification && (
                <div className="mt-6 text-center animate-bounce-in">
                  {selectedOption === effectiveCorrectIndex ? (
                    <div>
                      <p className="text-xl font-bold text-green-400">Bonne réponse !</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-bold text-red-400">
                        {selectedOption !== null ? "Mauvaise réponse !" : "Temps écoulé !"}
                      </p>
                    </div>
                  )}
                  { selectedOption !== null ? (
                      <p className="mt-2 text-white">
                        La bonne réponse était : {opts[effectiveCorrectIndex]}
                      </p> ) : (
                        <p className="mt-2 text-white">
                            Vous n'avez pas répondu à temps.
                        </p>
                        )
                  }
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <h3 className="text-lg font-bold mb-2 flex items-center text-white">
                Statut des joueurs <ArrowDown className="ml-2 h-4 w-4" />
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {activePlayers.map(player => (
                  <PlayerStatus
                    key={player.id}
                    player={player}
                    isActive={player.id === activePlayerId}
                    status={playerStatuses[player.id] || 'green'}
                    coinChange={coinChanges[player.id] || 0}
                    compact
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizRound1;
