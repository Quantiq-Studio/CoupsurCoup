
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import LoadingSpinner from '@/components/game/LoadingSpinner';
import GamificationSummary from '@/components/game/GamificationSummary';
import LevelProgress from '@/components/game/LevelProgress';
import { Award, BarChart, Calendar, Coins, Home, LogOut, Medal, ShoppingBag, Trophy, User } from 'lucide-react';
import {account} from "@/lib/appwrite.ts";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlayer, setCurrentPlayer } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock game history
  const gameHistory = [
    { id: 1, date: '18/05/2023', score: 120, rank: 1, players: 6 },
    { id: 2, date: '15/05/2023', score: 90, rank: 2, players: 5 },
    { id: 3, date: '10/05/2023', score: 75, rank: 3, players: 4 },
    { id: 4, date: '05/05/2023', score: 105, rank: 1, players: 6 },
  ];

  useEffect(() => {
    // Redirect if not logged in
    if (!currentPlayer?.email) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour voir votre profil",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [currentPlayer, navigate, toast]);
  
  const handleLogout = async () => {
    await account.deleteSession('current');
    setCurrentPlayer(null);
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès",
    });
    navigate('/');
  };

  if (isLoading || !currentPlayer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-game-gradient">
        <LoadingSpinner />
        <p className="mt-4 text-white">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-game-gradient">
      <BackgroundShapes />
      
      <div className="game-container flex flex-col py-8 z-10">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 mr-2" />
            Accueil
          </Button>
        </div>

        <div className="text-center mb-8 animate-bounce-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Mon profil</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="bg-white/95 backdrop-blur-sm animate-zoom-in shadow-lg border-accent/50 md:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 border-4 border-primary mb-4">
                <AvatarImage src={currentPlayer.avatar} alt={currentPlayer.name} />
                <AvatarFallback>{currentPlayer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold">{currentPlayer.name}</CardTitle>
              <CardDescription className="text-sm">{currentPlayer.email}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Level Progress */}
              <LevelProgress 
                level={currentPlayer.level || 1} 
                experience={currentPlayer.experience || 0}
                compact
              />
              
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-accent mr-2" />
                  <span className="text-sm">Score total</span>
                </div>
                <span className="font-bold">{currentPlayer.totalScore || 0}</span>
              </div>
              
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-secondary mr-2" />
                  <span className="text-sm">Parties jouées</span>
                </div>
                <span className="font-bold">{currentPlayer.gamesPlayed || 0}</span>
              </div>
              
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center">
                  <Coins className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm">Pièces</span>
                </div>
                <span className="font-bold">{currentPlayer.coins || 0}</span>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate('/badges')}
                >
                  <Medal className="h-4 w-4 mr-2" />
                  Badges
                </Button>
                
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate('/challenges')}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Défis
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate('/shop')}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Boutique
                </Button>
                
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate('/leaderboard')}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Classement
                </Button>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full mt-2"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Déconnexion
              </Button>
            </CardFooter>
          </Card>
          
          {/* Gamification Summary */}
          <GamificationSummary />
          
          {/* Game History */}
          <Card className="bg-white/95 backdrop-blur-sm animate-zoom-in shadow-lg border-accent/50 md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-primary" />
                Historique des parties
              </CardTitle>
              <CardDescription>
                Vos dernières performances
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="py-2 px-4">Date</th>
                      <th className="py-2 px-4">Score</th>
                      <th className="py-2 px-4">Rang</th>
                      <th className="py-2 px-4">Joueurs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameHistory.map((game) => (
                      <tr key={game.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-4">{game.date}</td>
                        <td className="py-3 px-4 font-medium">{game.score}</td>
                        <td className="py-3 px-4">
                          <span className={`py-1 px-2 rounded-full text-xs font-medium ${
                            game.rank === 1 ? 'bg-accent/30 text-accent-foreground' : 
                            game.rank === 2 ? 'bg-secondary/30 text-secondary-foreground' : 
                            'bg-muted/50'
                          }`}>
                            {game.rank === 1 ? '1er' : 
                             game.rank === 2 ? '2ème' : 
                             game.rank === 3 ? '3ème' : 
                             `${game.rank}ème`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {game.players}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate('/')}
              >
                Nouvelle partie
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
