
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Award, Home, Play, Share } from 'lucide-react';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { winner, players, resetGame } = useGame();
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Sort players by score for the leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  useEffect(() => {
    // Hide confetti after some time
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Le Coup sur Coup',
        text: `Je viens de jouer aux Coup sur Coup et ${winner ? `${winner.name} a gagné` : 'nous avons tous perdu'} !`,
        url: window.location.origin,
      }).catch((error) => {
        console.log('Error sharing:', error);
      });
    } else {
      console.log('Web Share API not supported in your browser');
      // You could fallback to copying to clipboard here
    }
  };
  
  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-game-gradient flex flex-col relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(50)].map((_, i) => {
            const size = Math.random() * 12 + 8;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 3;
            const color = ['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][Math.floor(Math.random() * 6)];
            
            return (
              <div
                key={i}
                className={`absolute top-0 ${color} rounded-md animate-confetti`}
                style={{
                  width: size,
                  height: size,
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }}
              />
            );
          })}
        </div>
      )}
      
      <div className="game-container flex flex-col flex-grow py-8 z-20">
        <div className="text-center mb-12 animate-bounce-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Fin de la partie !</h1>
          <p className="text-xl">Merci d'avoir participé aux Coup sur Coup</p>
        </div>
        
        {winner && (
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-10 text-center animate-zoom-in">
            <div className="relative inline-block">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Award className="w-8 h-8 text-yellow-800" />
              </div>
              <Avatar className="w-32 h-32 mx-auto border-4 border-accent">
                <AvatarImage src={winner.avatar} alt={winner.name} />
                <AvatarFallback>{winner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-3xl font-bold mt-4 mb-2">{winner.name}</h2>
            <p className="text-lg mb-2">a remporté la partie !</p>
            <p className="bg-white/30 inline-block px-4 py-1 rounded-full">
              Score final: <strong>{winner.score}</strong> points
            </p>
          </div>
        )}
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Award className="h-6 w-6 mr-2" />
            Classement final
          </h2>
          
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-400/30' : (
                    index === 1 ? 'bg-gray-400/30' : (
                      index === 2 ? 'bg-amber-700/30' : 'bg-white/10'
                    )
                  )
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center font-bold text-lg mr-4">
                  {index + 1}
                </div>
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={player.avatar} alt={player.name} />
                  <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-medium">{player.name}</h3>
                </div>
                <div className="font-bold text-lg">{player.score} pts</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="button-accent"
            onClick={handlePlayAgain}
          >
            <Play className="h-5 w-5 mr-2" />
            Rejouer
          </Button>
          
          <Button 
            className="button-secondary"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 mr-2" />
            Accueil
          </Button>
          
          <Button 
            className="button-primary"
            onClick={handleShare}
          >
            <Share className="h-5 w-5 mr-2" />
            Partager
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
