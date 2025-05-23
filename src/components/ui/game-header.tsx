
import React from 'react';
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, LogIn, LogOut } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface GameHeaderProps {
  showHomeButton?: boolean;
  className?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  showHomeButton = true,
  className
}) => {
  const navigate = useNavigate();
  const { currentPlayer, setCurrentPlayer } = useGame();
  const { toast } = useToast();
  
  const handleLogout = () => {
    setCurrentPlayer(null);
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès"
    });
    navigate('/');
  };
  
  return (
    <header className={cn(
      "w-full py-4 px-6 flex justify-between items-center z-10",
      className
    )}>
      {showHomeButton && (
        <Button 
          variant="outline"
          className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5 mr-2" />
          Accueil
        </Button>
      )}
      
      <div className="space-x-2">
        {currentPlayer?.email ? (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
              onClick={() => navigate('/profile')}
            >
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={currentPlayer.avatar} alt={currentPlayer.name} />
                <AvatarFallback>{currentPlayer.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              Mon profil
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Déconnexion
            </Button>
          </div>
        ) : (
          <>
            <Button 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
              onClick={() => navigate('/signin')}
            >
              <LogIn className="h-5 w-5 mr-2" />
              Connexion
            </Button>
            <Button 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
              onClick={() => navigate('/signup')}
            >
              <User className="h-5 w-5 mr-2" />
              Inscription
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
