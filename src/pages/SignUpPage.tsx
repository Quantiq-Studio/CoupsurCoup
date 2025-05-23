
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GameTitle } from '@/components/ui/game-title';
import { GameInput } from '@/components/ui/game-input';
import { GameButton } from '@/components/ui/game-button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/context/GameContext';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import AvatarSelector from '@/components/game/AvatarSelector';
import { useToast } from '@/hooks/use-toast';
import { avatarImages } from '@/data/avatars';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentPlayer } = useGame();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarImages[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call for registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, auto-login after signup
      if (name && email.includes('@') && password.length >= 6) {
        // Create a mock authenticated user
        setCurrentPlayer({
          id: 'user-' + Date.now(),
          name: name,
          avatar: selectedAvatar,
          score: 0,
          isHost: false,
          isEliminated: false,
          email: email,
          totalScore: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          coins: 1000
        });
        
        toast({
          title: 'Inscription réussie!',
          description: 'Bienvenue sur QuizMania.'
        });
        
        navigate('/');
      } else {
        toast({
          title: 'Erreur d\'inscription',
          description: 'Veuillez vérifier vos informations.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur d\'inscription',
        description: 'Une erreur est survenue. Veuillez réessayer.',
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
          <h2 className="text-2xl font-bold text-center mb-6">Créer un compte</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Nom d'utilisateur
              </label>
              <GameInput
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre pseudo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Choisissez un avatar
              </label>
              <AvatarSelector selectedAvatar={selectedAvatar} onSelect={setSelectedAvatar} />
            </div>
            
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
              <label htmlFor="password" className="block text-sm font-medium">
                Mot de passe
              </label>
              <GameInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
              />
            </div>
            
            <GameButton
              variant="primary"
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Création...' : 'Créer un compte'}
            </GameButton>
          </form>
          
          <div className="mt-6 text-center">
            <p>
              Déjà un compte?{' '}
              <Link
                to="/signin"
                className="text-blue-300 hover:text-blue-200 transition font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage;
