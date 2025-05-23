
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { GameButton } from '@/components/ui/game-button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionButton from '@/components/game/OptionButton';
import RoundTitle from '@/components/game/RoundTitle';
import PlayerStatus from '@/components/game/PlayerStatus';
import { GameNotification } from '@/components/ui/game-notification';
import { Swords, TimerIcon, ShieldCheck, ShieldX } from 'lucide-react';
import { CoinCounter } from '@/components/ui/coin-counter';
import { motion } from 'framer-motion';

// Theme options for the duel
const duelThemes = [
  {
    id: 'theme1',
    name: 'Géographie',
    wordplay: 'Tour du monde en 80 questions',
    description: 'Questions sur les pays, capitales et culture mondiale',
    image: '/placeholder.svg'
  },
  {
    id: 'theme2',
    name: 'Cinéma',
    wordplay: 'L\'écran vous est conté',
    description: 'Questions sur les films, acteurs et réalisateurs',
    image: '/placeholder.svg'
  },
  {
    id: 'theme3', 
    name: 'Histoire',
    wordplay: 'Les temps sont durs',
    description: 'Questions sur les périodes et personnages historiques',
    image: '/placeholder.svg'
  },
  {
    id: 'theme4',
    name: 'Sciences',
    wordplay: 'Élémentaire, mon cher',
    description: 'Questions sur la physique, chimie et biologie',
    image: '/placeholder.svg'
  }
];

const DuelPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId, playerId } = useParams<{ roomId: string; playerId: string }>();
  const { 
    players,
    questions,
    eliminatePlayer,
    updatePlayerScore,
    addCoins
  } = useGame();
  
  const [redPlayer, setRedPlayer] = useState<string | undefined>(playerId);
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [duelStage, setDuelStage] = useState<'select_opponent' | 'select_theme' | 'question' | 'result'>('select_opponent');
  const [selectedThemes, setSelectedThemes] = useState<typeof duelThemes>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [winner, setWinner] = useState<string | null>(null);
  const [coinChanges, setCoinChanges] = useState<Record<string, number>>({});
  
  const activePlayers = players.filter(p => !p.isEliminated && p.id !== redPlayer);
  
  // Get red player object
  const redPlayerObj = players.find(p => p.id === redPlayer);
  const opponentObj = players.find(p => p.id === selectedOpponent);
  
  // Initialize duel
  useEffect(() => {
    // If no red player ID is provided, navigate back
    if (!redPlayer || !redPlayerObj) {
      navigate(`/round1/${roomId}`);
      return;
    }
    
    // If only one player is left (no possible opponents), end the game
    if (activePlayers.length === 0) {
      navigate(`/results/${roomId}`);
      return;
    }
  }, [redPlayer, redPlayerObj, activePlayers, navigate, roomId]);
  
  // Timer logic
  useEffect(() => {
    if (duelStage !== 'question' || showResult) return;
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up - wrong answer
      handleAnswer(null);
    }
  }, [timeRemaining, duelStage, showResult]);
  
  // Handle opponent selection
  const handleOpponentSelect = (opponentId: string) => {
    setSelectedOpponent(opponentId);
    
    // Randomly select 2 themes for the opponent to choose from
    const shuffledThemes = [...duelThemes].sort(() => 0.5 - Math.random());
    setSelectedThemes(shuffledThemes.slice(0, 2));
    
    setDuelStage('select_theme');
  };
  
  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    
    // Get a random question (in a real app, you'd filter by theme)
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    
    setDuelStage('question');
    setTimeRemaining(15);
  };
  
  // Handle answer selection
  const handleAnswer = (optionIndex: number | null) => {
    setSelectedOption(optionIndex);
    setShowResult(true);
    
    const isCorrect = optionIndex === currentQuestion?.correctAnswer;
    
    // Determine winner and award coins
    if (isCorrect) {
      // Opponent wins, red player is eliminated
      setWinner(selectedOpponent);
      
      if (selectedOpponent) {
        // Award points and coins to opponent
        updatePlayerScore(selectedOpponent, 20);
        addCoins(selectedOpponent, 200);
        setCoinChanges(prev => ({ ...prev, [selectedOpponent]: 200 }));
        
        // Red player loses coins
        if (redPlayer) {
          addCoins(redPlayer, -150);
          setCoinChanges(prev => ({ ...prev, [redPlayer]: -150 }));
        }
      }
    } else {
      // Red player wins, opponent is eliminated
      setWinner(redPlayer || null);
      
      if (redPlayer) {
        // Award points and coins to red player
        updatePlayerScore(redPlayer, 20);
        addCoins(redPlayer, 200);
        setCoinChanges(prev => ({ ...prev, [redPlayer]: 200 }));
      }
      
      if (selectedOpponent) {
        // Opponent loses coins
        addCoins(selectedOpponent, -150);
        setCoinChanges(prev => ({ ...prev, [selectedOpponent]: -150 }));
      }
    }
    
    // After showing result for a few seconds, move to result screen
    setTimeout(() => {
      setDuelStage('result');
    }, 3000);
  };
  
  // Handle duel completion
  const handleDuelComplete = () => {
    if (winner === redPlayer) {
      // Red player won, eliminate the opponent
      if (selectedOpponent) eliminatePlayer(selectedOpponent);
    } else {
      // Opponent won, eliminate the red player
      if (redPlayer) eliminatePlayer(redPlayer);
    }
    
    // Return to the main game
    navigate(`/round1/${roomId}`);
  };
  
  return (
    <div className="min-h-screen bg-game-gradient flex flex-col">
      <div className="game-container flex flex-col flex-grow py-8">
        <RoundTitle 
          roundNumber={0} 
          title="Duel Décisif" 
          description="Un face-à-face où tout se joue sur une seule question!"
        />
        
        <div className="mb-8 text-center">
          {duelStage === 'select_opponent' && redPlayerObj && (
            <div className="animate-bounce-in">
              <GameNotification
                title="Duel Décisif!"
                message={`${redPlayerObj.name} doit choisir un adversaire pour un duel`}
                variant="warning"
                icon={Swords}
                className="mb-6 mx-auto max-w-md"
              />
              
              <h3 className="text-xl font-bold mb-4">Choisissez votre adversaire</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {activePlayers.map(player => (
                  <Card 
                    key={player.id}
                    className="bg-white/10 backdrop-blur-sm border-none hover:bg-white/20 transition-colors cursor-pointer"
                    onClick={() => handleOpponentSelect(player.id)}
                  >
                    <div className="p-4">
                      <PlayerStatus
                        player={player}
                        showCoins={true}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {duelStage === 'select_theme' && opponentObj && (
            <div className="animate-bounce-in">
              <h3 className="text-xl font-bold mb-2">{opponentObj.name} doit choisir un thème</h3>
              <p className="mb-6">Pour garder sa place dans le jeu, {opponentObj.name} doit choisir un des thèmes suivants et répondre correctement</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {selectedThemes.map((theme) => (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 overflow-hidden">
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={theme.image} 
                          alt={theme.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="text-lg font-bold">{theme.name}</h4>
                        <p className="text-sm font-italic text-white/70">"{theme.wordplay}"</p>
                        <p className="mt-2 text-sm">{theme.description}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {duelStage === 'question' && currentQuestion && opponentObj && (
            <div className="animate-bounce-in">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                  <span>Duel Décisif</span>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                  <TimerIcon className="h-4 w-4" />
                  <span>{timeRemaining}s</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-around gap-6 mb-8">
                {redPlayerObj && opponentObj && (
                  <>
                    <PlayerStatus
                      player={redPlayerObj}
                      status="red"
                      coinChange={coinChanges[redPlayerObj.id] || 0}
                    />
                    
                    <div className="flex flex-col items-center">
                      <Swords className="h-12 w-12 mb-2 text-yellow-500" />
                      <span className="text-lg font-bold">VS</span>
                    </div>
                    
                    <PlayerStatus
                      player={opponentObj}
                      status="green"
                      isActive={true}
                      coinChange={coinChanges[opponentObj.id] || 0}
                    />
                  </>
                )}
              </div>
              
              <Progress 
                value={(timeRemaining / 15) * 100} 
                className="h-2 mb-8"
              />
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
                <p className="mb-4 text-lg">
                  {opponentObj.name} doit répondre correctement pour éliminer {redPlayerObj?.name}
                </p>
                
                <QuestionDisplay 
                  question={currentQuestion.text}
                  category={currentQuestion.category || selectedThemes.find(t => t.id === selectedTheme)?.name || ''}
                  difficulty="hard"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <OptionButton 
                      key={index}
                      label={option}
                      selected={selectedOption === index}
                      correct={showResult && index === currentQuestion.correctAnswer}
                      incorrect={showResult && selectedOption === index && index !== currentQuestion.correctAnswer}
                      disabled={showResult}
                      onClick={() => handleAnswer(index)}
                    />
                  ))}
                </div>
                
                {showResult && (
                  <div className="mt-6 text-center animate-bounce-in">
                    {selectedOption === currentQuestion.correctAnswer ? (
                      <div>
                        <p className="text-xl font-bold text-green-400">Bonne réponse !</p>
                        <div className="flex items-center justify-center mt-1">
                          <span className="mr-2">+20 points</span>
                          <CoinCounter value={0} change={200} showIcon={true} />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl font-bold text-red-400">
                          {selectedOption !== null ? "Mauvaise réponse !" : "Temps écoulé !"}
                        </p>
                        <div className="flex items-center justify-center mt-1">
                          <CoinCounter value={0} change={-150} showIcon={true} />
                        </div>
                      </div>
                    )}
                    <p className="mt-2">
                      La bonne réponse était : {currentQuestion.options[currentQuestion.correctAnswer]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {duelStage === 'result' && (
            <div className="animate-bounce-in">
              <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl mb-8 max-w-xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">Résultat du duel</h3>
                
                {winner === redPlayer && redPlayerObj ? (
                  <div className="text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="inline-block mb-4 p-2 rounded-full bg-white/30"
                    >
                      <ShieldCheck className="h-16 w-16 text-green-400" />
                    </motion.div>
                    
                    <h4 className="text-xl mb-2">{redPlayerObj.name} remporte le duel!</h4>
                    <p className="mb-4">{opponentObj?.name} est éliminé</p>
                    
                    <div className="flex justify-center items-center mb-6">
                      <CoinCounter 
                        value={redPlayerObj.coins || 0} 
                        change={200} 
                        size="lg" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="inline-block mb-4 p-2 rounded-full bg-white/30"
                    >
                      <ShieldX className="h-16 w-16 text-red-400" />
                    </motion.div>
                    
                    <h4 className="text-xl mb-2">{opponentObj?.name} remporte le duel!</h4>
                    <p className="mb-4">{redPlayerObj?.name} est éliminé</p>
                    
                    <div className="flex justify-center items-center mb-6">
                      <CoinCounter 
                        value={opponentObj?.coins || 0} 
                        change={200} 
                        size="lg" 
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <GameButton 
                    variant="primary" 
                    onClick={handleDuelComplete}
                  >
                    Continuer la partie
                  </GameButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuelPage;
