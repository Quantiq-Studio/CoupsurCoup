
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionButton from '@/components/game/OptionButton';
import ScoreBoard from '@/components/game/ScoreBoard';
import RoundTitle from '@/components/game/RoundTitle';
import { TimerIcon } from 'lucide-react';

const QuizRound1: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    players, 
    updatePlayerScore,
    timeRemaining,
    setTimeRemaining,
    currentPlayer
  } = useGame();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [countdownMessage, setCountdownMessage] = useState('');
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = 3; // We'll use 3 questions for Round 1
  
  // Timer logic
  useEffect(() => {
    if (showResult || roundComplete) return;
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!showResult && !roundComplete) {
      // Time's up!
      setShowResult(true);
      const timer = setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedOption(null);
          setShowResult(false);
          setTimeRemaining(10); // Reset timer
        } else {
          setRoundComplete(true);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, showResult, currentQuestionIndex, setTimeRemaining, roundComplete, setCurrentQuestionIndex, totalQuestions]);
  
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
          navigate(`/round2/${roomId}`);
        }
      }, 1000);
      
      return () => clearInterval(countdown);
    }
  }, [roundComplete, navigate, roomId]);
  
  const handleOptionSelect = (optionIndex: number) => {
    if (showResult || selectedOption !== null) return;
    
    setSelectedOption(optionIndex);
    setShowResult(true);
    
    // Award points if correct
    if (optionIndex === currentQuestion.correctAnswer) {
      if (currentPlayer) {
        updatePlayerScore(currentPlayer.id, 10); // Award 10 points for correct answer
      }
    }
    
    // Move to next question after delay
    const timer = setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setShowResult(false);
        setTimeRemaining(10); // Reset timer
      } else {
        setRoundComplete(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  };
  
  return (
    <div className="min-h-screen bg-game-gradient flex flex-col">
      <div className="game-container flex flex-col flex-grow py-8">
        <RoundTitle 
          roundNumber={1} 
          title="Coup d'envoi" 
          description="Répondez correctement pour gagner des points!"
        />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
            <span>Question {currentQuestionIndex + 1}/{totalQuestions}</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
            <TimerIcon className="h-4 w-4" />
            <span>{timeRemaining}s</span>
          </div>
        </div>
        
        {roundComplete ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center animate-bounce-in">
            <h2 className="text-2xl font-bold mb-4">Fin de la manche 1 !</h2>
            <p className="text-xl mb-8">{countdownMessage}</p>
            <ScoreBoard players={players} />
          </div>
        ) : (
          <>
            <Progress 
              value={(timeRemaining / 10) * 100} 
              className="h-2 mb-8"
            />
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 animate-zoom-in">
              {currentQuestion && (
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
                    disabled={showResult}
                    onClick={() => handleOptionSelect(index)}
                  />
                ))}
              </div>
              
              {showResult && (
                <div className="mt-6 text-center animate-bounce-in">
                  {selectedOption === currentQuestion.correctAnswer ? (
                    <p className="text-xl font-bold text-green-400">Bonne réponse ! +10 points</p>
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
            </div>
            
            <div className="mt-auto">
              <ScoreBoard players={players} compact />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizRound1;
