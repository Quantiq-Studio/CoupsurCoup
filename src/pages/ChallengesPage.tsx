
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import ChallengeCard from '@/components/game/ChallengeCard';
import { Calendar, Home, Trophy } from 'lucide-react';

// Mock challenge data (in a real app, this would come from an API)
const mockDailyChallenges = [
  {
    id: "daily-1",
    name: "Victoire du jour",
    description: "Remporter une partie aujourd'hui",
    icon: "trophy",
    type: "daily" as const,
    progress: 0,
    maxProgress: 1,
    completed: false,
    rewardCoins: 10,
    rewardXP: 20,
    expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  },
  {
    id: "daily-2",
    name: "Réponses parfaites",
    description: "Répondre correctement à 5 questions",
    icon: "star",
    type: "daily" as const,
    progress: 3,
    maxProgress: 5,
    completed: false,
    rewardCoins: 5,
    rewardXP: 10,
    expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  },
];

const mockWeeklyChallenges = [
  {
    id: "weekly-1",
    name: "Joueur régulier",
    description: "Jouer 5 parties cette semaine",
    icon: "calendar",
    type: "weekly" as const,
    progress: 2,
    maxProgress: 5,
    completed: false,
    rewardCoins: 30,
    rewardXP: 50,
    expiresAt: (() => {
      const date = new Date();
      const day = date.getDay();
      const daysUntilSunday = day === 0 ? 0 : 7 - day;
      return new Date(date.setDate(date.getDate() + daysUntilSunday)).toISOString();
    })()
  },
  {
    id: "weekly-2",
    name: "Collectionneur",
    description: "Obtenir 2 nouveaux badges",
    icon: "award",
    type: "weekly" as const,
    progress: 1,
    maxProgress: 2,
    completed: false,
    rewardCoins: 20,
    rewardXP: 40,
    expiresAt: (() => {
      const date = new Date();
      const day = date.getDay();
      const daysUntilSunday = day === 0 ? 0 : 7 - day;
      return new Date(date.setDate(date.getDate() + daysUntilSunday)).toISOString();
    })()
  },
];

const mockSpecialChallenges = [
  {
    id: "special-1",
    name: "Maître de la connaissance",
    description: "Atteindre le niveau 10",
    icon: "medal",
    type: "special" as const,
    progress: 6,
    maxProgress: 10,
    completed: false,
    rewardCoins: 100,
    rewardXP: 0,
    expiresAt: undefined
  },
  {
    id: "special-2",
    name: "Fidèle",
    description: "Se connecter 7 jours consécutifs",
    icon: "calendar-check",
    type: "special" as const,
    progress: 4,
    maxProgress: 7,
    completed: false,
    rewardCoins: 50,
    rewardXP: 75,
    expiresAt: undefined
  },
];

const ChallengesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlayer, addCoins, addExperience } = useGame();
  const [activeTab, setActiveTab] = useState('daily');
  
  const handleClaimReward = (challenge: any) => {
    if (currentPlayer) {
      addCoins(currentPlayer.id, challenge.rewardCoins);
      addExperience(currentPlayer.id, challenge.rewardXP);
      
      toast({
        title: "Récompense réclamée !",
        description: `Vous avez reçu ${challenge.rewardCoins} pièces et ${challenge.rewardXP} XP`,
      });
    }
  };
  
  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-game-gradient">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Connectez-vous</h1>
          <p className="mb-6">Vous devez être connecté pour voir vos défis</p>
          <Button onClick={() => navigate('/signin')}>Se connecter</Button>
        </div>
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
            className="bg-white/20 hover:bg-white/30"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 mr-2" />
            Accueil
          </Button>
        </div>

        <div className="text-center mb-8 animate-bounce-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Défis et Objectifs</h1>
          <p className="text-xl text-white/80">Accomplissez des défis pour gagner des récompenses !</p>
        </div>
        
        <Tabs
          defaultValue="daily"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6 bg-white/20">
            <TabsTrigger value="daily" className="data-[state=active]:bg-white/30">
              <Calendar className="h-4 w-4 mr-2" />
              Quotidiens
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-white/30">
              <Calendar className="h-4 w-4 mr-2" />
              Hebdomadaires
            </TabsTrigger>
            <TabsTrigger value="special" className="data-[state=active]:bg-white/30">
              <Trophy className="h-4 w-4 mr-2" />
              Spéciaux
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockDailyChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  onClaim={() => handleClaimReward(challenge)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockWeeklyChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  onClaim={() => handleClaimReward(challenge)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="special" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSpecialChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  onClaim={() => handleClaimReward(challenge)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChallengesPage;
