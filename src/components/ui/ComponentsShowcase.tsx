
import React from 'react';
import { GameTitle } from './game-title';
import { GameCard } from './game-card';
import { GameButton } from './game-button';
import { GameInput } from './game-input';
import { GameAvatar } from './game-avatar';
import { GameHeader } from './game-header';
import { GameNotification } from './game-notification';
import { StatsCard } from './stats-card';
import { AvatarGroup } from './avatar-group';
import { CountdownTimer } from './countdown-timer';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Users, Star, Bell } from 'lucide-react';

export const ComponentsShowcase: React.FC = () => {
  const exampleAvatars = [
    { src: '/avatars/avatar-1.png', name: 'User 1' },
    { src: '/avatars/avatar-2.png', name: 'User 2' },
    { src: '/avatars/avatar-3.png', name: 'User 3' },
    { src: '/avatars/avatar-4.png', name: 'User 4' },
    { src: '/avatars/avatar-5.png', name: 'User 5' },
    { src: '/avatars/avatar-6.png', name: 'User 6' },
    { src: '/avatars/avatar-7.png', name: 'User 7' },
  ];

  return (
    <div className="p-6 space-y-8">
      <GameTitle 
        subtitle="Voici les composants réutilisables disponibles"
        badge={<span className="text-sm font-bold text-accent-foreground">Documentation</span>}
      >
        Bibliothèque de Composants
      </GameTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buttons */}
        <GameCard title="Buttons" description="Différents styles de boutons">
          <div className="grid grid-cols-2 gap-4">
            <GameButton variant="primary">
              <Trophy className="h-4 w-4 mr-2" />
              Primary
            </GameButton>
            <GameButton variant="secondary">
              <Award className="h-4 w-4 mr-2" />
              Secondary
            </GameButton>
            <GameButton variant="accent">
              <Star className="h-4 w-4 mr-2" />
              Accent
            </GameButton>
            <GameButton variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Outline
            </GameButton>
            <GameButton variant="ghost">Ghost</GameButton>
          </div>
        </GameCard>

        {/* Inputs */}
        <GameCard title="Inputs" description="Champs de formulaire avec labels">
          <div className="space-y-4">
            <GameInput 
              label="Texte simple" 
              placeholder="Entrez du texte"
            />
            <GameInput 
              label="Avec description" 
              placeholder="Entrez un email"
              type="email"
              description="Nous ne partagerons jamais votre email"
            />
            <GameInput 
              label="Mot de passe" 
              type="password"
              placeholder="••••••••"
            />
          </div>
        </GameCard>

        {/* Avatars */}
        <GameCard title="Avatars" description="Différentes tailles d'avatars et états">
          <div className="flex items-center justify-around mb-4">
            <GameAvatar size="xs" src="/avatars/avatar-1.png" name="XS" />
            <GameAvatar size="sm" src="/avatars/avatar-2.png" name="SM" />
            <GameAvatar size="md" src="/avatars/avatar-3.png" name="MD" />
            <GameAvatar size="lg" src="/avatars/avatar-4.png" name="LG" />
            <GameAvatar size="xl" src="/avatars/avatar-5.png" name="XL" />
          </div>
          <div className="flex items-center justify-around">
            <GameAvatar src="/avatars/avatar-1.png" status="online" />
            <GameAvatar src="/avatars/avatar-2.png" status="offline" />
            <GameAvatar src="/avatars/avatar-3.png" status="away" />
            <GameAvatar src="/avatars/avatar-4.png" status="busy" />
            <GameAvatar 
              src="/avatars/avatar-5.png" 
              badge={
                <Badge variant="default" className="h-5 w-5 flex items-center justify-center p-0">
                  <Trophy className="h-3 w-3" />
                </Badge>
              }
            />
          </div>
        </GameCard>

        {/* Avatar Group */}
        <GameCard title="Avatar Group" description="Groupes d'avatars avec limite">
          <div className="space-y-4">
            <AvatarGroup avatars={exampleAvatars.slice(0, 3)} size="sm" />
            <AvatarGroup avatars={exampleAvatars} size="md" limit={4} />
            <AvatarGroup avatars={exampleAvatars} size="lg" limit={3} />
          </div>
        </GameCard>

        {/* Stats Cards */}
        <GameCard title="Stats Cards" description="Cartes de statistiques avec tendances">
          <div className="grid grid-cols-2 gap-4">
            <StatsCard 
              title="Parties jouées" 
              value={42}
              icon={Users}
              trend={{ value: 12, positive: true }}
            />
            <StatsCard 
              title="Score total" 
              value="1,250"
              icon={Trophy}
              trend={{ value: 5, positive: false }}
            />
          </div>
        </GameCard>

        {/* Countdown Timer */}
        <GameCard title="Countdown Timer" description="Minuteur avec barre de progression">
          <div className="space-y-4">
            <div className="flex justify-around">
              <CountdownTimer seconds={30} size="sm" />
              <CountdownTimer seconds={60} size="md" />
              <CountdownTimer seconds={120} size="lg" />
            </div>
            <CountdownTimer 
              seconds={10} 
              size="lg"
              className="w-full"
              onComplete={() => console.log("Countdown complete!")}
            />
          </div>
        </GameCard>

        {/* Notifications */}
        <GameCard title="Notifications" description="Différents types de notifications">
          <div className="space-y-4">
            <GameNotification
              title="Information"
              message="Voici une notification standard"
              timestamp="Il y a 5 minutes"
            />
            <GameNotification
              title="Succès"
              message="Vous avez gagné un nouveau badge!"
              variant="success"
              timestamp="Il y a 2 heures"
              icon={Trophy}
            />
            <GameNotification
              title="Attention"
              message="Votre session expire dans 5 minutes"
              variant="warning"
              timestamp="Maintenant"
            />
          </div>
        </GameCard>
      </div>
    </div>
  );
};
