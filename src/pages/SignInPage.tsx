import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus, Home } from 'lucide-react';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import LoadingSpinner from '@/components/game/LoadingSpinner';
import {account, databases} from "@/lib/appwrite.ts";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlayer, setCurrentPlayer } = useGame();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const PLAYERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PLAYERS_COLLECTION_ID;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: 'Erreur de connexion',
          description: 'Veuillez remplir tous les champs',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      try {
        await account.deleteSession('current');
      } catch (e) {
        console.log('Aucune session à supprimer ou déjà expirée');
      }

      await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      const player = await databases.getDocument(
          DATABASE_ID,
          PLAYERS_COLLECTION_ID,
          user.$id
      );

      setCurrentPlayer({
        id: user.$id,
        name: player.name,
        avatar: player.avatar,
        email: user.email,
        score: player.score,
        isHost: false,
        isEliminated: false,
        totalScore: player.score,
        gamesPlayed: 0,
        gamesWon: 0,
        coins: player.coins,
        level: player.level,
        experience: player.experience,
      });

      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans le Coup sur Coup !',
      });

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-game-gradient">
      <BackgroundShapes />
      
      <div className="game-container flex flex-col flex-grow items-center justify-center py-10 md:py-16 z-10">
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm animate-zoom-in border-accent/50 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-playfair font-bold text-gradient">Connexion</CardTitle>
              <CardDescription className="font-poppins">
                Connectez-vous pour suivre vos statistiques et cumuler des points
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4 font-poppins">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email" 
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-accent/30 focus-visible:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      Mot de passe
                    </label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-accent/30 focus-visible:ring-primary"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner />
                      <span className="ml-2">Connexion...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 font-poppins">
              <div className="text-sm text-center text-muted-foreground">
                Pas encore de compte?{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Créer un compte
                </Link>
              </div>
              
              <Button
                variant="outline"
                className="w-full" 
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5 mr-2" />
                Retour à l'accueil
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
