
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
import { TimerIcon, AlertTriangle, Heart } from 'lucide-react';

const QuizRound3: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    players,
    setPlayers,
    eliminatePlayer,
    currentPlayer,
    setWinner
  } = useGame();
  
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [playerErrors, setPlayerErrors] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [countdownMessage, setCountdownMessage] = useState('');
  
  const currentQuestion = questions[currentQuestionIndex % questions.length]; // Use modulo to cycle through questions
  const activePlayers = players.filter(p => !p.isEliminated);
  
  // Initialize round
  useEffect(() => {
    if (activePlayers.length > 0 && !activePlayer) {
      setActivePlayer(activePlayers[0].id);
      
      // Initialize error counter for each player
      const errors: Record<string, number> = {};
      activePlayers.forEach(player => {
        errors[player.id] = 0;
      });
      setPlayerErrors(errors);
    }
  }, [activePlayers, activePlayer]);
  
  // Timer logic
  useEffect(() => {
    if (showResult || !activePlayer || roundComplete) return;
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up - wrong answer
      handleTimeUp();
    }
  }, [timeRemaining, activePlayer, showResult, roundComplete]);
  
  // Handle time up (player ran out of time)
  const handleTimeUp = () => {
    setShowResult(true);
    
    setTimeout(() => {
      if (activePlayer) {
        // Increment error count for this player
        setPlayerErrors(prev => ({
          ...prev,
          [activePlayer]: (prev[activePlayer] || 0) + 1
        }));
        
        // If player has 2 errors, eliminate them
        if ((playerErrors[activePlayer] || 0) + 1 >= 2) {
          eliminatePlayer(activePlayer);
        }
        
        moveToNextPlayer();
      }
    }, 2000);
  };
  
  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (showResult || selectedOption !== null || !activePlayer) return;
    
    setSelectedOption(optionIndex);
    setShowResult(true);
    
    setTimeout(() => {
      if (optionIndex === currentQuestion.correctAnswer) {
        // Correct answer, just move to next player
        moveToNextPlayer();
      } else {
        // Wrong answer - increment error count
        setPlayerErrors(prev => ({
          ...prev,
          [activePlayer]: (prev[activePlayer] || 0) + 1
        }));
        
        // If player has 2 errors, eliminate them
        if ((playerErrors[activePlayer] || 0) + 1 >= 2) {
          eliminatePlayer(activePlayer);
        }
        
        moveToNextPlayer();
      }
    }, 2000);
  };
  
  // Move to the next player
  const moveToNextPlayer = () => {
    setSelectedOption(null);
    setShowResult(false);
    setTimeRemaining(5);
    setCurrentQuestionIndex(prev => prev + 1);
    
    // If only one player remains, end the round
    const remainingPlayers = players.filter(p => !p.isEliminated);
    if (remainingPlayers.length === 1) {
      setWinner(remainingPlayers[0]);
      setRoundComplete(true);
      return;
    }
    
    // Find the next player in rotation
    if (activePlayer) {
      const currentIndex = remainingPlayers.findIndex(p => p.id === activePlayer);
      const nextIndex = (currentIndex + 1) % remainingPlayers.length;
      setActivePlayer(remainingPlayers[nextIndex].id);
    }
  };
  
  // Round completion logic
  useEffect(() => {
    if (roundComplete) {
      let count = 3;
      setCountdownMessage(`Passage à la manche finale dans ${count}...`);
      
      const countdown = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownMessage(`Passage à la manche finale dans ${count}...`);
        } else {
          clearInterval(countdown);
          navigate(`/final-grid/${roomId}`);
        }
      }, 1000);
      
      return () => clearInterval(countdown);
    }
  }, [roundComplete, navigate, roomId]);
  
  const getPlayerById = (id: string) => {
    return players.find(p => p.id === id);
  };
  
  const activePlayerObj = activePlayer ? getPlayerById(activePlayer) : null;
  
  return (
    <div className="min-h-screen bg-game-gradient flex flex-col">
      <div className="game-container flex flex-col flex-grow py-8">
        <RoundTitle 
          roundNumber={3} 
          title="Coup fatal" 
          description="Répondez rapidement ! Deux erreurs et vous êtes éliminé."
        />
        
        {roundComplete ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center animate-bounce-in">
            <h2 className="text-2xl font-bold mb-4">Fin de la manche 3 !</h2>
            <p className="text-xl mb-4">{countdownMessage}</p>
            
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl mb-8">
              <h3 className="text-xl mb-4">Félicitations !</h3>
              
              {players.filter(p => !p.isEliminated).map(player => (
                <div key={player.id} className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-3 border-4 border-accent">
                    <AvatarImage src={player.avatar} alt={player.name} />
                    <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold">{player.name}</h3>
                  <p className="mt-2 text-lg">accède à la finale !</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
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
            
            {activePlayerObj && (
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="bg-white/20 p-4 rounded-xl text-center animate-zoom-in">
                  <Avatar className="w-16 h-16 mx-auto border-2 border-white">
                    <AvatarImage src={activePlayerObj.avatar} alt={activePlayerObj.name} />
                    <AvatarFallback>{activePlayerObj.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium mt-2 mb-1">{activePlayerObj.name}</h3>
                  <div className="flex justify-center gap-2">
                    <Heart fill={(playerErrors[activePlayerObj.id] || 0) >= 1 ? 'transparent' : 'currentColor'} />
                    <Heart fill={(playerErrors[activePlayerObj.id] || 0) >= 2 ? 'transparent' : 'currentColor'} />
                  </div>
                </div>
              </div>
            )}
            
            <Progress 
              value={(timeRemaining / 5) * 100} 
              className="h-2 mb-8"
            />
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 animate-zoom-in">
              {currentQuestion && (
                <>
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
                      { selectedOption !== null ? (
                          <p className="mt-2 text-white">
                            La bonne réponse était : {currentQuestion?.options[currentQuestion.correctAnswer]}
                          </p> ) : (
                          <p className="mt-2 text-white">
                            Vous n'avez pas répondu à temps.
                          </p>
                      )
                      }
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-auto">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5" />
                Zone de danger
              </h3>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {activePlayers.map(player => (
                    <div 
                      key={player.id} 
                      className="flex flex-col items-center text-center"
                    >
                      <Avatar className="w-12 h-12 mb-2">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{player.name}</p>
                      <div className="flex gap-1 mt-1">
                        <Heart 
                          className="h-4 w-4" 
                          fill={(playerErrors[player.id] || 0) >= 1 ? 'transparent' : 'currentColor'}
                        />
                        <Heart 
                          className="h-4 w-4" 
                          fill={(playerErrors[player.id] || 0) >= 2 ? 'transparent' : 'currentColor'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizRound3;
