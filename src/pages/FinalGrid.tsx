
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionButton from '@/components/game/OptionButton';
import RoundTitle from '@/components/game/RoundTitle';
import { TimerIcon, TrophyIcon, SearchIcon, PuzzleIcon } from 'lucide-react';

const FinalGrid: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    gridItems,
    setGridItems,
    winner,
    setWinner,
    finalAnswer,
    setFinalAnswer,
    players
  } = useGame();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [finalGuess, setFinalGuess] = useState('');
  const [roundComplete, setRoundComplete] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  
  const currentQuestion = questions[currentQuestionIndex % questions.length];
  const FINAL_ANSWER = "MANCHOT EMPEREUR"; // The solution to the grid
  
  // Timer logic for question answering
  useEffect(() => {
    if (showResult || !winner || roundComplete) return;
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up - wrong answer
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        setSelectedOption(null);
        setTimeRemaining(15);
      }, 3000);
    }
  }, [timeRemaining, showResult, winner, roundComplete]);
  
  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (showResult || selectedOption !== null) return;
    
    setSelectedOption(optionIndex);
    setShowResult(true);
    
    setTimeout(() => {
      if (optionIndex === currentQuestion.correctAnswer) {
        // Correct answer, reveal a grid item
        revealGridItem();
        setCurrentQuestionIndex(prev => prev + 1);
      }
      
      setShowResult(false);
      setSelectedOption(null);
      setTimeRemaining(15);
    }, 2000);
  };
  
  // Reveal a random grid item
  const revealGridItem = () => {
    const hiddenItems = gridItems.filter(item => !item.isRevealed);
    
    if (hiddenItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * hiddenItems.length);
      const itemToReveal = hiddenItems[randomIndex];
      
      setGridItems(prev => 
        prev.map(item => 
          item.id === itemToReveal.id ? { ...item, isRevealed: true } : item
        )
      );
      
      setRevealedCount(prev => prev + 1);
    }
  };
  
  // Check final answer
  const checkFinalAnswer = () => {
    setFinalAnswer(finalGuess);
    
    if (finalGuess.trim().toLowerCase() === FINAL_ANSWER.toLowerCase()) {
      setRoundComplete(true);
      setTimeout(() => {
        navigate(`/results/${roomId}`);
      }, 3000);
    } else {
      setShowFinalDialog(false);
      setFinalGuess('');
    }
  };
  
  return (
    <div className="min-h-screen bg-game-gradient flex flex-col">
      <div className="game-container flex flex-col flex-grow py-8">
        <RoundTitle 
          roundNumber={4} 
          title="La Grille des Indices" 
          description="Découvrez l'image mystère et proposez votre solution !"
        />
        
        {roundComplete ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center animate-bounce-in">
            <h2 className="text-2xl font-bold mb-4">Félicitations !</h2>
            <p className="text-xl mb-4">Vous avez trouvé la bonne réponse.</p>
            <p className="text-lg mb-8">Redirection vers les résultats...</p>
            <div className="w-32 h-32 rounded-full bg-yellow-400 animate-pulse flex items-center justify-center">
              <TrophyIcon className="w-16 h-16 text-white" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap md:flex-nowrap gap-8">
              <div className="w-full md:w-1/2 lg:w-3/5">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center">
                      <PuzzleIcon className="h-5 w-5 mr-2" />
                      Grille des indices
                    </h3>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      {gridItems.filter(item => item.isRevealed).length} / {gridItems.length} révélés
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 md:gap-3">
                    {gridItems.map(item => (
                      <Card 
                        key={item.id}
                        className={`aspect-square overflow-hidden relative ${
                          item.isRevealed 
                            ? 'bg-transparent animate-flip' 
                            : 'bg-gradient-to-br from-indigo-600 to-purple-700'
                        }`}
                      >
                        {item.isRevealed ? (
                          <div className="w-full h-full flex flex-col">
                            <div className="flex-grow flex items-center justify-center">
                              <img 
                                src={item.image} 
                                alt={item.clue} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-1 bg-black/50 text-xs text-center">{item.clue}</div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                            {item.id}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <Dialog open={showFinalDialog} onOpenChange={setShowFinalDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="button-accent"
                          disabled={gridItems.filter(item => item.isRevealed).length < 3}
                        >
                          <SearchIcon className="h-5 w-5 mr-2" />
                          Proposer une solution
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Proposer votre solution</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>
                            D'après les indices révélés, quelle est selon vous la solution ?
                          </p>
                          <Input 
                            value={finalGuess}
                            onChange={(e) => setFinalGuess(e.target.value)}
                            placeholder="Votre réponse..."
                            className="uppercase"
                          />
                          <Button 
                            className="w-full button-primary" 
                            onClick={checkFinalAnswer}
                          >
                            Valider
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 lg:w-2/5">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Révéler un nouvel indice</h3>
                    <div className="flex items-center gap-2">
                      <TimerIcon className="h-4 w-4" />
                      <span>{timeRemaining}s</span>
                    </div>
                  </div>
                  
                  {currentQuestion && !showResult && (
                    <>
                      <QuestionDisplay 
                        question={currentQuestion.text}
                        category={currentQuestion.category || ''}
                        difficulty={currentQuestion.difficulty || 'medium'}
                        compact
                      />
                      
                      <div className="grid grid-cols-1 gap-3 mt-4">
                        {currentQuestion.options.map((option, index) => (
                          <OptionButton 
                            key={index}
                            label={option}
                            selected={selectedOption === index}
                            correct={showResult && index === currentQuestion.correctAnswer}
                            incorrect={showResult && selectedOption === index && index !== currentQuestion.correctAnswer}
                            disabled={showResult}
                            onClick={() => handleOptionSelect(index)}
                            compact
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {showResult && (
                    <div className="text-center py-6 animate-bounce-in">
                      {selectedOption === currentQuestion.correctAnswer ? (
                        <>
                          <p className="text-xl font-bold text-green-400 mb-2">Bonne réponse !</p>
                          <p>Un nouvel indice est révélé sur la grille.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-red-400 mb-2">
                            {selectedOption !== null ? "Mauvaise réponse !" : "Temps écoulé !"}
                          </p>
                          <p>La bonne réponse était : {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                          <p className="mt-2">Essayez une nouvelle question pour révéler un indice.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {winner && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <h3 className="text-lg font-medium mb-3">Finaliste</h3>
                    <Avatar className="w-20 h-20 mx-auto border-4 border-accent">
                      <AvatarImage src={winner.avatar} alt={winner.name} />
                      <AvatarFallback>{winner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h4 className="text-xl font-bold mt-2">{winner.name}</h4>
                    <p className="text-sm mt-1">{winner.score} points</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinalGrid;
