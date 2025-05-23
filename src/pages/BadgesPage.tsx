
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import BadgeComponent from '@/components/game/Badge';
import { Award, Home, Medal, Star, Trophy } from 'lucide-react';

// Mock badges data
const allBadges = [
  {
    id: 'badge-1',
    name: 'Premier Coup',
    description: 'Remporter sa première partie',
    icon: 'trophy',
    rarity: 'common' as const,
    earnedAt: new Date().toISOString()
  },
  {
    id: 'badge-2',
    name: 'Sans faute',
    description: '100% de bonnes réponses dans une partie',
    icon: 'star',
    rarity: 'uncommon' as const,
  },
  {
    id: 'badge-3',
    name: 'Survivant',
    description: 'Être le dernier éliminé',
    icon: 'medal',
    rarity: 'rare' as const,
  },
  {
    id: 'badge-4',
    name: 'Expert en Géographie',
    description: 'Répondre correctement à 20 questions de géographie',
    icon: 'globe',
    rarity: 'epic' as const,
  },
  {
    id: 'badge-5',
    name: 'Champion Légende',
    description: 'Remporter 10 parties',
    icon: 'crown',
    rarity: 'legendary' as const,
  },
];

// Mock achievements data
const achievements = [
  {
    id: 'achievement-1',
    name: 'Joueur assidu',
    description: 'Jouer 10 parties',
    icon: 'calendar',
    progress: 7,
    maxProgress: 10,
    completed: false,
    rewardCoins: 50,
    rewardXP: 75,
  },
  {
    id: 'achievement-2',
    name: 'Collectionneur',
    description: 'Obtenir 5 badges différents',
    icon: 'award',
    progress: 1,
    maxProgress: 5,
    completed: false,
    rewardCoins: 100,
    rewardXP: 150,
  },
  {
    id: 'achievement-3',
    name: 'Connaisseur',
    description: 'Répondre correctement à 50 questions',
    icon: 'brain',
    progress: 35,
    maxProgress: 50,
    completed: false,
    rewardCoins: 150,
    rewardXP: 200,
  },
];

const BadgesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer } = useGame();
  const [activeTab, setActiveTab] = useState('badges');
  
  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-game-gradient">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Connectez-vous</h1>
          <p className="mb-6">Vous devez être connecté pour voir vos badges</p>
          <Button onClick={() => navigate('/signin')}>Se connecter</Button>
        </div>
      </div>
    );
  }
  
  // For this demo, we'll use the mock badges, but in a real app we'd get them from currentPlayer
  const playerBadges = currentPlayer.badges || [allBadges[0]]; 
  const playerBadgeIds = new Set(playerBadges.map(b => b.id));
  
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Badges et Succès</h1>
          <p className="text-xl text-white/80">Votre collection personnelle</p>
        </div>
        
        <Tabs
          defaultValue="badges"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6 bg-white/20">
            <TabsTrigger value="badges" className="data-[state=active]:bg-white/30">
              <Award className="h-4 w-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-white/30">
              <Trophy className="h-4 w-4 mr-2" />
              Succès
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-primary" />
                  Votre collection de badges
                </CardTitle>
                <CardDescription>
                  {playerBadges.length} badge{playerBadges.length > 1 ? 's' : ''} obtenu{playerBadges.length > 1 ? 's' : ''} sur {allBadges.length}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <h3 className="font-bold mb-4">Badges par rareté</h3>
                
                <div className="space-y-6">
                  {(['legendary', 'epic', 'rare', 'uncommon', 'common'] as const).map(rarity => {
                    const rarityBadges = allBadges.filter(badge => badge.rarity === rarity);
                    const hasRarityBadges = rarityBadges.length > 0;
                    
                    if (!hasRarityBadges) return null;
                    
                    return (
                      <div key={rarity} className="space-y-2">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium">
                            {rarity === 'legendary' && 'Légendaire'}
                            {rarity === 'epic' && 'Épique'}
                            {rarity === 'rare' && 'Rare'}
                            {rarity === 'uncommon' && 'Peu commun'}
                            {rarity === 'common' && 'Commun'}
                          </h4>
                          <Badge className={`ml-2 ${
                            rarity === 'legendary' ? 'bg-yellow-400' : 
                            rarity === 'epic' ? 'bg-purple-500' : 
                            rarity === 'rare' ? 'bg-blue-500' : 
                            rarity === 'uncommon' ? 'bg-green-500' : 
                            'bg-gray-400'
                          }`}>
                            {rarityBadges.filter(b => playerBadgeIds.has(b.id)).length}/{rarityBadges.length}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                          {rarityBadges.map(badge => {
                            const earned = playerBadgeIds.has(badge.id);
                            const earnedBadge = earned ? 
                              playerBadges.find(b => b.id === badge.id) || badge : 
                              badge;
                            
                            return (
                              <div key={badge.id} className={`text-center ${!earned ? 'opacity-40' : ''}`}>
                                <div className="flex justify-center mb-1">
                                  <BadgeComponent badge={earnedBadge} size="md" />
                                </div>
                                <p className="text-xs font-medium truncate">{badge.name}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-primary" />
                  Succès à débloquer
                </CardTitle>
                <CardDescription>
                  {achievements.filter(a => a.completed).length} succès accompli{achievements.filter(a => a.completed).length > 1 ? 's' : ''} sur {achievements.length}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {achievements.map(achievement => {
                    const progressPercentage = Math.floor((achievement.progress / achievement.maxProgress) * 100);
                    
                    return (
                      <div key={achievement.id} className="bg-white/70 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold">{achievement.name}</h3>
                          <Badge className={achievement.completed ? "bg-green-500" : "bg-muted"}>
                            {achievement.completed ? "Complété" : `${achievement.progress}/${achievement.maxProgress}`}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                        
                        <Progress value={progressPercentage} className="h-2 mb-3" />
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex space-x-4">
                            <div className="flex items-center text-yellow-600">
                              <Star className="h-4 w-4 mr-1" />
                              <span>{achievement.rewardXP} XP</span>
                            </div>
                            <div className="flex items-center text-amber-600">
                              <Medal className="h-4 w-4 mr-1" />
                              <span>{achievement.rewardCoins} pièces</span>
                            </div>
                          </div>
                          
                          {achievement.completed && (
                            <Badge variant="outline" className="border-green-500 text-green-500 bg-green-50">
                              Récompense réclamée
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BadgesPage;
