import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Award, Home, Play, Share } from 'lucide-react';
import Confetti from 'react-confetti';
import {CoinCounter} from "@/components/ui/coin-counter.tsx";

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { winner, players, resetGame } = useGame();
  const realWinner = players.find(p => p.id === winner?.id) ?? winner ?? null;

  /* confettis */
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 15000);
    return () => clearTimeout(t);
  }, []);

  /* classement */
  const sorted = [...players].sort((a,b) => b.coins - a.coins);

  /* share */
  const handleShare = () => {
    const msg = `Je viens de jouer à Coup sur Coup et ${
        realWinner ? `${realWinner.name} a gagné !` : 'nous avons tous perdu…'}`
    ;
    if (navigator.share) {
      navigator.share({ title: 'Coup sur Coup', text: msg, url: window.location.origin })
          .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Lien copié dans le presse-papier !');
    }
  };

  return (
      <div className="min-h-screen bg-game-gradient flex flex-col relative overflow-hidden">
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

        <div className="game-container flex flex-col flex-grow py-8 z-20">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 animate-bounce-in text-white">
            Fin de la partie !
          </h1>
          {!!realWinner && (
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-10 text-center animate-zoom-in">
                <div className="relative inline-block">
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-400 rounded-full flex
                              items-center justify-center animate-pulse">
                    <Award className="w-8 h-8 text-yellow-800" />
                  </div>
                  <Avatar className="w-32 h-32 mx-auto border-4 border-accent">
                    <AvatarImage src={realWinner.avatar} />
                    <AvatarFallback>{realWinner.name.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-3xl font-bold mt-4 mb-2 text-white">{realWinner.name}</h2>
                <p className="text-lg mb-2 text-white">remporte la partie !</p>
                <p className="bg-white/30 inline-block px-4 py-1 rounded-full text-white">
                  <CoinCounter
                      value={realWinner.coins || 1000}
                      size="sm"
                  />
                </p>
              </div>
          )}

          {/* CLASSEMENT */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 flex items-center text-white">
              <Award className="h-6 w-6 mr-2"/> Classement final
            </h2>
            <div className="space-y-3">
              {sorted.map((pl,i) => {
                const medal = ['🥇','🥈','🥉'][i] ?? '';
                const bg = ['bg-yellow-400/20','bg-gray-300/20','bg-amber-700/20'][i] ?? 'bg-white/10';
                return (
                    <div key={pl.id} className={`flex items-center p-3 rounded-lg ${bg} text-white`}>
                      <div className="w-8 text-center text-xl">{medal || i+1}</div>
                      <Avatar className="h-10 w-10 mx-3">
                        <AvatarImage src={pl.avatar}/>
                        <AvatarFallback>{pl.name.slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="flex-grow text-white">{pl.name}</span>
                      <CoinCounter
                          value={pl.coins || 1000}
                          size="sm"
                      />
                    </div>
                );
              })}
            </div>
          </div>

          {/* BOUTONS */}
          <div className="mt-auto flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" onClick={() => navigate('/')}>
              <Home className="h-5 w-5 mr-2"/> Accueil
            </Button>
            <Button variant="secondary" onClick={handleShare}>
              <Share className="h-5 w-5 mr-2"/> Partager
            </Button>
          </div>
        </div>
      </div>
  );
};

export default ResultsPage;
