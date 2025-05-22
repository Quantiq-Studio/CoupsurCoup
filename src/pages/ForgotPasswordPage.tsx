
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import LoadingSpinner from '@/components/game/LoadingSpinner';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email requis',
        description: 'Veuillez entrer votre adresse email',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast({
        title: 'Email envoyé',
        description: 'Consultez votre boîte mail pour réinitialiser votre mot de passe',
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-game-gradient">
      <BackgroundShapes />
      
      <div className="game-container flex flex-col flex-grow items-center justify-center py-10 md:py-16 z-10">
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm animate-zoom-in border-accent/50 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gradient">Mot de passe oublié</CardTitle>
              <CardDescription>
                {!isSent 
                  ? "Entrez votre email pour réinitialiser votre mot de passe" 
                  : "Vérifiez votre boîte mail pour les instructions"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  
                  <Button 
                    type="submit" 
                    className="w-full button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner />
                        <span className="ml-2">Envoi en cours...</span>
                      </div>
                    ) : (
                      <>
                        <Mail className="h-5 w-5 mr-2" />
                        Envoyer les instructions
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="bg-accent/20 rounded-full p-4 inline-flex items-center justify-center mb-4">
                    <Mail className="h-10 w-10 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Un email avec les instructions de réinitialisation a été envoyé à <span className="font-medium">{email}</span>
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Button
                variant="outline"
                className="w-full" 
                onClick={() => navigate('/signin')}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour à la connexion
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
