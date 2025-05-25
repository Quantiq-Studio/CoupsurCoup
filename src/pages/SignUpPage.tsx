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
import AvatarSelector from '@/components/game/AvatarSelector';
import {account, databases} from "@/lib/appwrite.ts";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentPlayer } = useGame();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<string>('/placeholder.svg');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password || !username) {
        toast({
          title: 'Erreur d\'inscription',
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

      await account.create('unique()', email, password, username);
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      await databases.createDocument(
          '68308ece00320290574e',
          '68308f130020e76ceeec',
          user.$id,
          {
            name: user.name,
            avatar: avatar,
            isBot: false,
            coins: 1000,
            score: 0,
            level: 1,
            experience: 0,
            lastSeenAt: new Date().toISOString(),
          }
      );

      setCurrentPlayer({
        id: user.$id,
        name: user.name,
        avatar: avatar,
        score: 0,
        isHost: false,
        isEliminated: false,
        email: user.email,
        totalScore: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        coins: 1000,
      });

      toast({ title: 'Inscription réussie', description: 'Bienvenue sur Le Coup sur Coup !' });
      navigate('/profile');

    } catch (error: any) {
      toast({
        title: 'Erreur',
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
              <CardTitle className="text-2xl font-bold text-gradient">Créer un compte</CardTitle>
              <CardDescription>
                Inscrivez-vous pour suivre vos statistiques et cumuler des points
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
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
                  <label htmlFor="username" className="text-sm font-medium">
                    Pseudo
                  </label>
                  <Input
                    id="username"
                    placeholder="Votre pseudo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-accent/30 focus-visible:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="avatar" className="text-sm font-medium">
                    Choisissez votre avatar
                  </label>
                  <AvatarSelector onSelect={setAvatar} selectedAvatar={avatar} />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-accent/30 focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 caractères
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner />
                      <span className="ml-2">Création du compte...</span>
                    </div>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      S'inscrire
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Déjà un compte?{" "}
                <Link to="/signin" className="text-primary font-medium hover:underline">
                  Se connecter
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

export default SignUpPage;
