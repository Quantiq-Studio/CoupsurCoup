
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LevelProgress from './LevelProgress';
import BadgeComponent from './Badge';
import { Award, Calendar, Coins, Trophy } from 'lucide-react';

const GamificationSummary: React.FC = () => {
  const { currentPlayer } = useGame();

  if (!currentPlayer) return null;

  return (
    <Card className="bg-white/95 backdrop-blur-sm animate-zoom-in shadow-lg border-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Progression et Récompenses
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level and XP section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Niveau et Expérience</h3>
          <LevelProgress 
            level={currentPlayer.level || 1} 
            experience={currentPlayer.experience || 0} 
            compact={false}
          />
        </div>
        
        {/* Player stats */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Statistiques</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Coins className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm">Pièces</span>
              </div>
              <div className="text-lg font-bold">{currentPlayer.coins || 0}</div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Trophy className="h-4 w-4 text-accent mr-2" />
                <span className="text-sm">Victoires</span>
              </div>
              <div className="text-lg font-bold">{currentPlayer.gamesWon || 0}</div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-secondary mr-2" />
                <span className="text-sm">Série active</span>
              </div>
              <div className="text-lg font-bold">{currentPlayer.streakDays || 0} jours</div>
            </div>
          </div>
        </div>
        
        {/* Badges */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Badges récents</h3>
            <span className="text-xs text-muted-foreground">
              {(currentPlayer.badges?.length || 0)} obtenu{(currentPlayer.badges?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {currentPlayer.badges && currentPlayer.badges.length > 0 ? (
              currentPlayer.badges.slice(0, 5).map(badge => (
                <BadgeComponent key={badge.id} badge={badge} size="md" />
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-6 text-sm text-muted-foreground">
                <Award className="h-4 w-4 mr-2 opacity-50" />
                Aucun badge obtenu pour le moment
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GamificationSummary;
