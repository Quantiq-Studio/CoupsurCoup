
import React from 'react';
import { Challenge } from '@/context/GameContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Coins, Star } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onClaim?: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClaim }) => {
  const progressPercentage = Math.floor((challenge.progress / challenge.maxProgress) * 100);
  
  const getTimeRemaining = () => {
    if (!challenge.expiresAt) return null;
    
    const now = new Date();
    const expiryDate = new Date(challenge.expiresAt);
    const diffInMs = expiryDate.getTime() - now.getTime();
    
    if (diffInMs <= 0) return 'Expiré';
    
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 24) return `${diffInHours}h restantes`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}j restants`;
  };
  
  return (
    <Card className="bg-white/95 border-accent/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className={`h-1 ${challenge.type === 'daily' ? 'bg-accent' : challenge.type === 'weekly' ? 'bg-secondary' : 'bg-primary'}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-foreground">{challenge.name}</h3>
          <div className={`px-2 py-0.5 text-xs rounded-full ${
            challenge.type === 'daily' ? 'bg-accent/20 text-accent-foreground' :
            challenge.type === 'weekly' ? 'bg-secondary/20 text-secondary-foreground' :
            'bg-primary/20 text-primary-foreground'
          }`}>
            {challenge.type === 'daily' ? 'Quotidien' : 
             challenge.type === 'weekly' ? 'Hebdomadaire' : 'Spécial'}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span className="font-medium">{challenge.progress}/{challenge.maxProgress}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {challenge.expiresAt && (
            <div className="text-xs text-muted-foreground text-right">
              {getTimeRemaining()}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-1">
        <div className="flex justify-between items-center w-full">
          <div className="flex space-x-3">
            <div className="flex items-center text-yellow-600">
              <Coins className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{challenge.rewardCoins}</span>
            </div>
            <div className="flex items-center text-purple-600">
              <Star className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{challenge.rewardXP} XP</span>
            </div>
          </div>
          
          {challenge.completed && onClaim && (
            <button 
              className="px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full hover:bg-accent/80 transition-colors"
              onClick={onClaim}
            >
              Réclamer
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
