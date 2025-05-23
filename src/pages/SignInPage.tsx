
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GameTitle } from '@/components/ui/game-title';
import { GameInput } from '@/components/ui/game-input';
import { GameButton } from '@/components/ui/game-button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/context/GameContext';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import { useToast } from '@/hooks/use-toast';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentPlayer } = useGame();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call for authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, auto-login
      if (email.includes('@')) {
        // Create a mock authenticated user
        setCurrentPlayer({
          id: 'user-' + Date.now(),
          name: email.split('@')[0],
          avatar: `/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.png`,
          score: 0,
          isHost: false,
          isEliminated: false,
          email: email,
          totalScore: 1250,
          gamesPlayed: 10,
          gamesWon: 3,
          coins: 1000
        });
        
        toast({
          title: 'Connexion réussie!',
          description: 'Bienvenue sur QuizMania.'
        });
        
        navigate('/');
      } else {
        toast({
          title: 'Erreur de connexion',
          description: 'L\'adresse email est invalide.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: 'Vérifiez vos identifiants et réessayez.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-violet-900 via-blue-900 to-violet-800">
      <BackgroundShapes />
      
      <GameTitle className="mb-8">QuizMania</GameTitle>
      
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Adresse email
              </label>
              <GameInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-300 hover:text-blue-200 transition"
                >
                  Mot de passe oublié?
                </Link>
              </div>
              <GameInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <GameButton
              variant="primary"
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </GameButton>
          </form>
          
          <div className="mt-6 text-center">
            <p>
              Pas encore de compte?{' '}
              <Link
                to="/signup"
                className="text-blue-300 hover:text-blue-200 transition font-medium"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignInPage;
