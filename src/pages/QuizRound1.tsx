import React, { useState, useEffect } from 'react';
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
    updatePlayerScore,
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
  const [showStatusChangeNotification, setShowStatusChangeNotification] = useState<{playerId: string, status: 'orange' | 'red'} | null>(null);
  const [roundTransitionCountdown, setRoundTransitionCountdown] = useState<number | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
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

  // Check for round transitions based on number of active players
  useEffect(() => {
    // If we already have a countdown running, don't start another one
    if (roundTransitionCountdown !== null || showDuelNotification) return;
    
    const nonEliminatedPlayers = players.filter(p => !p.isEliminated).length;
    
    if (nonEliminatedPlayers <= 3 && nonEliminatedPlayers > 2) {
      // Transition to round 2
      setRoundTransitionCountdown(3);
      toast({
        title: "Phase suivante",
        description: "Il ne reste que 3 joueurs ! Passage à la phase 2...",
        variant: "default",
      });
    } else if (nonEliminatedPlayers <= 2) {
      // Transition to round 3
      setRoundTransitionCountdown(3);
      toast({
        title: "Phase finale",
        description: "Il ne reste que 2 joueurs ! Passage à la phase 3...",
        variant: "default",
      });
    }
  }, [players, roundTransitionCountdown, showDuelNotification, toast]);
  
  // Handle round transition countdown
  useEffect(() => {
    if (roundTransitionCountdown === null) return;
    
    const nonEliminatedPlayers = players.filter(p => !p.isEliminated).length;
    
    if (roundTransitionCountdown > 0) {
      const timer = setTimeout(() => {
        setRoundTransitionCountdown(roundTransitionCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Navigate to the appropriate round
      if (nonEliminatedPlayers <= 3 && nonEliminatedPlayers > 2) {
        navigate(`/round2/${roomId}`);
      } else if (nonEliminatedPlayers <= 2) {
        navigate(`/round3/${roomId}`);
      }
    }
  }, [roundTransitionCountdown, players, navigate, roomId]);
  
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
  
  // Update player status (green -> orange -> red)
  const updatePlayerStatus = (playerId: string) => {
    setPlayerStatuses(prev => {
      const currentStatus = prev[playerId] || 'green';
      let newStatus: 'green' | 'orange' | 'red' = currentStatus;
      
      if (currentStatus === 'green') {
        newStatus = 'orange';
        
        // Show notification for status change to orange
        setShowStatusChangeNotification({playerId, status: 'orange'});
        
        toast({
          title: "Attention !",
          description: `${getPlayerById(playerId)?.name} est maintenant en alerte.`,
          variant: "warning",
        });
        
      } else if (currentStatus === 'orange') {
        newStatus = 'red';
        
        // Show notification for status change to red
        setShowStatusChangeNotification({playerId, status: 'red'});
        
        toast({
          title: "Danger !",
          description: `${getPlayerById(playerId)?.name} est en zone rouge.`,
          variant: "destructive",
        });
        
        // Trigger duel notification
        setDuelPlayerId(playerId);
        setShowDuelNotification(true);
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
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    
    // Find next active player
    if (activePlayerId) {
      const currentIndex = activePlayers.findIndex(p => p.id === activePlayerId);
      const nextIndex = (currentIndex + 1) % activePlayers.length;
      setActivePlayerId(activePlayers[nextIndex].id);
    }
  };
  
  // Handle moving to duel mode
  const handleStartDuel = () => {
    setShowDuelNotification(false);
    navigate(`/duel/${roomId}/${duelPlayerId}`);
  };
  
  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (showResult || selectedOption !== null || !activePlayerId) return;
    
    setSelectedOption(optionIndex);
    setShowResult(true);
    
    if (optionIndex === currentQuestion?.correctAnswer) {
      // Correct answer
      updatePlayerScore(activePlayerId, 10);
      
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
  
  // Render round transition notification
  const renderRoundTransitionNotification = () => {
    if (roundTransitionCountdown === null) return null;
    
    const nonEliminatedPlayers = players.filter(p => !p.isEliminated).length;
    let title, message;
    
    if (nonEliminatedPlayers <= 3 && nonEliminatedPlayers > 2) {
      title = "Passage à la phase 2";
      message = `Il ne reste que ${nonEliminatedPlayers} joueurs ! Passage à la phase 2 dans ${roundTransitionCountdown}...`;
    } else {
      title = "Passage à la phase 3";
      message = `Il ne reste que ${nonEliminatedPlayers} joueurs ! Passage à la phase 3 dans ${roundTransitionCountdown}...`;
    }
    
    return (
      <div className="mb-4 animate-bounce-in">
        <GameNotification
          title={title}
          message={message}
          variant="default"
          icon={TimerIcon}
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
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
            <span>Question {currentQuestionIndex + 1}</span>
          </div>
          
          {activePlayer && roundTransitionCountdown === null && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
              <TimerIcon className="h-4 w-4" />
              <span>{timeRemaining}s</span>
            </div>
          )}
        </div>
        
        {renderRoundTransitionNotification()}
        
        {showDuelNotification && duelPlayerId && (
          <div className="mb-6 animate-bounce-in">
            <GameNotification
              title="Duel Décisif!"
              message={`${getPlayerById(duelPlayerId)?.name} doit affronter un adversaire en duel!`}
              variant="error"
              icon={AlertCircle}
              className="mb-4"
            />
            
            <div className="flex justify-center">
              <GameButton 
                variant="accent"
                onClick={handleStartDuel}
              >
                Commencer le duel
              </GameButton>
            </div>
          </div>
        )}
        
        {renderStatusChangeNotification()}
        
        {!showDuelNotification && roundTransitionCountdown === null && (
          <>
            {activePlayer && (
              <div className="mb-6 animate-fade-in">
                <h3 className="text-center text-lg mb-2">Au tour de</h3>
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
                  question={currentQuestion.text}
                  category={currentQuestion.category || ''}
                  difficulty={currentQuestion.difficulty || 'medium'}
                />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {currentQuestion?.options.map((option, index) => (
                  <OptionButton 
                    key={index}
                    label={option}
                    selected={selectedOption === index}
                    correct={showResult && index === currentQuestion.correctAnswer}
                    incorrect={showResult && selectedOption === index && index !== currentQuestion.correctAnswer}
                    disabled={showResult || showDuelNotification}
                    onClick={() => handleOptionSelect(index)}
                  />
                ))}
              </div>
              
              {showResult && !showDuelNotification && (
                <div className="mt-6 text-center animate-bounce-in">
                  {selectedOption === currentQuestion?.correctAnswer ? (
                    <div>
                      <p className="text-xl font-bold text-green-400">Bonne réponse !</p>
                      <div className="flex items-center justify-center mt-1">
                        <span className="mr-2">+10 points</span>
                        <CoinCounter value={0} change={100} showIcon={true} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-bold text-red-400">
                        {selectedOption !== null ? "Mauvaise réponse !" : "Temps écoulé !"}
                      </p>
                      {selectedOption !== null && (
                        <div className="flex items-center justify-center mt-1">
                          <CoinCounter value={0} change={-75} showIcon={true} />
                        </div>
                      )}
                    </div>
                  )}
                  <p className="mt-2">
                    La bonne réponse était : {currentQuestion?.options[currentQuestion.correctAnswer]}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <h3 className="text-lg font-bold mb-2 flex items-center">
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
