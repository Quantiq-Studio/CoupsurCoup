
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionButton from '@/components/game/OptionButton';
import RoundTitle from '@/components/game/RoundTitle';
import ScoreBoard from '@/components/game/ScoreBoard';
import { TimerIcon, Swords } from 'lucide-react';

const QuizRound2: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    players,
    setPlayers,
    updatePlayerScore,
    eliminatePlayer,
    currentPlayer
  } = useGame();
  
  const [duelPlayers, setDuelPlayers] = useState<{ player1: string; player2: string }>({ player1: '', player2: '' });
  const [activePlayer, setActivePlayer] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [countdownMessage, setCountdownMessage] = useState('');
  const [duelCount, setDuelCount] = useState(0);
  
  const currentQuestion = questions[currentQuestionIndex];
  const activePlayers = players.filter(p => !p.isEliminated);
  const totalDuels = Math.floor(activePlayers.length / 2);
  
  // Initialize first duel
  useEffect(() => {
    if (activePlayers.length >= 2 && duelPlayers.player1 === '') {
      // For demonstration, select first two non-eliminated players
      const player1 = activePlayers[0].id;
      const player2 = activePlayers[1].id;
      setDuelPlayers({ player1, player2 });
      setActivePlayer(player1);
    }
  }, [activePlayers, duelPlayers]);
  
  // Timer logic
  useEffect(() => {
    if (showResult || !activePlayer) return;
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up - wrong answer
      handleTimeUp();
    }
  }, [timeRemaining, activePlayer, showResult]);
  
  // Handle time up (player ran out of time)
  const handleTimeUp = () => {
    setShowResult(true);
    
    // Current player is eliminated since they ran out of time
    setTimeout(() => {
      if (activePlayer === duelPlayers.player1) {
        eliminatePlayer(duelPlayers.player1);
        endDuel();
      } else {
        eliminatePlayer(duelPlayers.player2);
        endDuel();
      }
    }, 2000);
  };
  
  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (showResult || selectedOption !== null) return;
    
    setSelectedOption(optionIndex);
    setShowResult(true);
    
    setTimeout(() => {
      if (optionIndex === currentQuestion.correctAnswer) {
        // Correct answer
        if (activePlayer === duelPlayers.player1) {
          // Switch to player 2
          setActivePlayer(duelPlayers.player2);
          // Move to next question
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // Player 2 is correct, eliminate player 1
          eliminatePlayer(duelPlayers.player1);
          endDuel();
        }
      } else {
        // Wrong answer - player is eliminated
        eliminatePlayer(activePlayer);
        endDuel();
      }
      
      // Reset for next question
      setSelectedOption(null);
      setShowResult(false);
      setTimeRemaining(10);
    }, 2000);
  };
  
  // End current duel and set up next one if available
  const endDuel = () => {
    const updatedActivePlayers = players.filter(p => !p.isEliminated);
    setDuelCount(prev => prev + 1);
    
    // If we have enough players for another duel
    if (duelCount < totalDuels - 1 && updatedActivePlayers.length >= 2) {
      const nextPlayer1 = updatedActivePlayers[0].id;
      const nextPlayer2 = updatedActivePlayers[1].id;
      
      setTimeout(() => {
        setDuelPlayers({ player1: nextPlayer1, player2: nextPlayer2 });
        setActivePlayer(nextPlayer1);
        setCurrentQuestionIndex(prev => prev + 1);
      }, 2000);
    } else {
      // Round is complete
      setRoundComplete(true);
    }
  };
  
  // Round completion logic
  useEffect(() => {
    if (roundComplete) {
      let count = 3;
      setCountdownMessage(`Passage à la manche suivante dans ${count}...`);
      
      const countdown = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownMessage(`Passage à la manche suivante dans ${count}...`);
        } else {
          clearInterval(countdown);
          navigate(`/round3/${roomId}`);
        }
      }, 1000);
      
      return () => clearInterval(countdown);
    }
  }, [roundComplete, navigate, roomId]);
  
  const getPlayerById = (id: string) => {
    return players.find(p => p.id === id);
  };
  
  const player1 = getPlayerById(duelPlayers.player1);
  const player2 = getPlayerById(duelPlayers.player2);
  
  return (
    <div className="min-h-screen bg-game-gradient flex flex-col">
      <div className="game-container flex flex-col flex-grow py-8">
        <RoundTitle 
          roundNumber={2} 
          title="Coup par coup" 
          description="Duel entre joueurs, répondez correctement ou soyez éliminé !"
        />
        
        {roundComplete ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center animate-bounce-in">
            <h2 className="text-2xl font-bold mb-4">Fin de la manche 2 !</h2>
            <p className="text-xl mb-8">{countdownMessage}</p>
            <ScoreBoard players={players} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                <span>Duel {duelCount + 1}/{totalDuels}</span>
              </div>
              
              {activePlayer && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                  <TimerIcon className="h-4 w-4" />
                  <span>{timeRemaining}s</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 mb-8">
              {player1 && player2 && (
                <>
                  <div className={`text-center ${activePlayer === player1.id ? 'scale-110 bg-white/20 p-4 rounded-xl' : ''}`}>
                    <Avatar className="w-16 h-16 md:w-24 md:h-24 mx-auto border-4 border-white">
                      <AvatarImage src={player1.avatar} alt={player1.name} />
                      <AvatarFallback>{player1.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg md:text-xl font-bold mt-2">{player1.name}</h3>
                    <p className="text-sm">{player1.score} pts</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Swords className="h-12 w-12 mb-2" />
                    <span className="text-lg font-bold">VS</span>
                  </div>
                  
                  <div className={`text-center ${activePlayer === player2.id ? 'scale-110 bg-white/20 p-4 rounded-xl' : ''}`}>
                    <Avatar className="w-16 h-16 md:w-24 md:h-24 mx-auto border-4 border-white">
                      <AvatarImage src={player2.avatar} alt={player2.name} />
                      <AvatarFallback>{player2.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg md:text-xl font-bold mt-2">{player2.name}</h3>
                    <p className="text-sm">{player2.score} pts</p>
                  </div>
                </>
              )}
            </div>
            
            {activePlayer && (
              <>
                <Progress 
                  value={(timeRemaining / 10) * 100} 
                  className="h-2 mb-8"
                />
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 animate-zoom-in">
                  {currentQuestion && (
                    <>
                      <p className="text-center mb-4">
                        C'est au tour de <strong>{getPlayerById(activePlayer)?.name}</strong>
                      </p>
                      
                      <QuestionDisplay 
                        question={currentQuestion.text}
                        category={currentQuestion.category || ''}
                        difficulty={currentQuestion.difficulty || 'medium'}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {currentQuestion.options.map((option, index) => (
                          <OptionButton 
                            key={index}
                            label={option}
                            selected={selectedOption === index}
                            correct={showResult && index === currentQuestion.correctAnswer}
                            incorrect={showResult && selectedOption === index && index !== currentQuestion.correctAnswer}
                            disabled={showResult}
                            onClick={() => handleOptionSelect(index)}
                          />
                        ))}
                      </div>
                      
                      {showResult && (
                        <div className="mt-6 text-center animate-bounce-in">
                          {selectedOption === currentQuestion.correctAnswer ? (
                            <p className="text-xl font-bold text-green-400">Bonne réponse !</p>
                          ) : (
                            <p className="text-xl font-bold text-red-400">
                              {selectedOption !== null ? "Mauvaise réponse !" : "Temps écoulé !"}
                            </p>
                          )}
                          <p className="mt-2">
                            La bonne réponse était : {currentQuestion.options[currentQuestion.correctAnswer]}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
            
            <div className="mt-auto">
              <h3 className="text-lg font-bold mb-2">Joueurs restants :</h3>
              <ScoreBoard players={players.filter(p => !p.isEliminated)} compact />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizRound2;
