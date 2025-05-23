
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BarChart, Home, Medal, Star, Trophy } from 'lucide-react';

// Mock leaderboard data
const weeklyLeaders = [
  { id: 'player-1', name: 'JeanQuiz', avatar: '/placeholder.svg', score: 420, gamesWon: 5 },
  { id: 'player-2', name: 'MasterQuestion', avatar: '/placeholder.svg', score: 385, gamesWon: 4 },
  { id: 'player-3', name: 'ProDuSavoir', avatar: '/placeholder.svg', score: 350, gamesWon: 3 },
  { id: 'player-4', name: 'Questionnaire92', avatar: '/placeholder.svg', score: 312, gamesWon: 3 },
  { id: 'player-5', name: 'LeToutSavant', avatar: '/placeholder.svg', score: 298, gamesWon: 2 },
  { id: 'player-6', name: 'GenieQuiz', avatar: '/placeholder.svg', score: 267, gamesWon: 2 },
  { id: 'player-7', name: 'ConnaissTout', avatar: '/placeholder.svg', score: 245, gamesWon: 1 },
  { id: 'player-8', name: 'MaitreJeu', avatar: '/placeholder.svg', score: 230, gamesWon: 1 },
  { id: 'player-9', name: 'SavoirFaire', avatar: '/placeholder.svg', score: 210, gamesWon: 1 },
  { id: 'player-10', name: 'ForceQuiz', avatar: '/placeholder.svg', score: 195, gamesWon: 0 },
];

const allTimeLeaders = [
  { id: 'player-1', name: 'JeanQuiz', avatar: '/placeholder.svg', score: 2150, gamesWon: 32 },
  { id: 'player-5', name: 'LeToutSavant', avatar: '/placeholder.svg', score: 1820, gamesWon: 25 },
  { id: 'player-3', name: 'ProDuSavoir', avatar: '/placeholder.svg', score: 1790, gamesWon: 24 },
  { id: 'player-2', name: 'MasterQuestion', avatar: '/placeholder.svg', score: 1680, gamesWon: 20 },
  { id: 'player-8', name: 'MaitreJeu', avatar: '/placeholder.svg', score: 1550, gamesWon: 19 },
  { id: 'player-6', name: 'GenieQuiz', avatar: '/placeholder.svg', score: 1430, gamesWon: 17 },
  { id: 'player-4', name: 'Questionnaire92', avatar: '/placeholder.svg', score: 1320, gamesWon: 15 },
  { id: 'player-7', name: 'ConnaissTout', avatar: '/placeholder.svg', score: 1180, gamesWon: 14 },
  { id: 'player-9', name: 'SavoirFaire', avatar: '/placeholder.svg', score: 980, gamesWon: 10 },
  { id: 'player-10', name: 'ForceQuiz', avatar: '/placeholder.svg', score: 850, gamesWon: 8 },
];

// Player stats by category
const categoryLeaders = {
  'geography': [
    { id: 'player-3', name: 'ProDuSavoir', avatar: '/placeholder.svg', score: 320 },
    { id: 'player-1', name: 'JeanQuiz', avatar: '/placeholder.svg', score: 280 },
    { id: 'player-5', name: 'LeToutSavant', avatar: '/placeholder.svg', score: 240 },
  ],
  'history': [
    { id: 'player-5', name: 'LeToutSavant', avatar: '/placeholder.svg', score: 350 },
    { id: 'player-2', name: 'MasterQuestion', avatar: '/placeholder.svg', score: 310 },
    { id: 'player-8', name: 'MaitreJeu', avatar: '/placeholder.svg', score: 290 },
  ],
  'science': [
    { id: 'player-1', name: 'JeanQuiz', avatar: '/placeholder.svg', score: 380 },
    { id: 'player-6', name: 'GenieQuiz', avatar: '/placeholder.svg', score: 320 },
    { id: 'player-4', name: 'Questionnaire92', avatar: '/placeholder.svg', score: 270 },
  ],
};

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('weekly');
  const [activeCategory, setActiveCategory] = useState('geography');
  
  const renderLeaderRow = (player: any, index: number) => {
    return (
      <tr 
        key={player.id} 
        className={`border-b border-border/50 hover:bg-muted/20 ${
          index < 3 ? 'font-medium' : ''
        }`}
      >
        <td className="py-3 px-4">
          <div className="flex items-center">
            {index === 0 && <Medal className="h-5 w-5 text-yellow-400 mr-2" />}
            {index === 1 && <Medal className="h-5 w-5 text-gray-400 mr-2" />}
            {index === 2 && <Medal className="h-5 w-5 text-amber-700 mr-2" />}
            {index > 2 && <span className="w-5 text-center mr-2">{index + 1}</span>}
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={player.avatar} alt={player.name} />
              <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{player.name}</span>
          </div>
        </td>
        <td className="py-3 px-4 font-bold">{player.score}</td>
        {player.gamesWon !== undefined && (
          <td className="py-3 px-4">
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-accent mr-1" />
              {player.gamesWon}
            </div>
          </td>
        )}
      </tr>
    );
  };
  
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Classement</h1>
          <p className="text-xl text-white/80">Les meilleurs joueurs du Coup sur Coup</p>
        </div>
        
        <Tabs
          defaultValue="weekly"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6 bg-white/20">
            <TabsTrigger value="weekly" className="data-[state=active]:bg-white/30">
              Cette semaine
            </TabsTrigger>
            <TabsTrigger value="alltime" className="data-[state=active]:bg-white/30">
              Tout temps
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-white/30">
              Par catégorie
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="mt-0 animate-fade-in">
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-primary" />
                  Classement hebdomadaire
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-border">
                        <th className="py-2 px-4 w-16">Rang</th>
                        <th className="py-2 px-4">Joueur</th>
                        <th className="py-2 px-4">Score</th>
                        <th className="py-2 px-4">Victoires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyLeaders.map((player, index) => renderLeaderRow(player, index))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alltime" className="mt-0 animate-fade-in">
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-primary" />
                  Classement de tous les temps
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-border">
                        <th className="py-2 px-4 w-16">Rang</th>
                        <th className="py-2 px-4">Joueur</th>
                        <th className="py-2 px-4">Score Total</th>
                        <th className="py-2 px-4">Victoires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTimeLeaders.map((player, index) => renderLeaderRow(player, index))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-0 animate-fade-in">
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-accent/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-primary" />
                    Classement par catégorie
                  </CardTitle>
                  
                  <div className="mt-4 sm:mt-0">
                    <select 
                      className="bg-muted rounded-md px-3 py-1 border border-border"
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                    >
                      <option value="geography">Géographie</option>
                      <option value="history">Histoire</option>
                      <option value="science">Science</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-border">
                        <th className="py-2 px-4 w-16">Rang</th>
                        <th className="py-2 px-4">Joueur</th>
                        <th className="py-2 px-4">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryLeaders[activeCategory as keyof typeof categoryLeaders].map((player, index) => 
                        renderLeaderRow(player, index)
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeaderboardPage;
