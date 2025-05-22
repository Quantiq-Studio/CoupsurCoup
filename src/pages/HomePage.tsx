
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import AvatarSelector from '@/components/game/AvatarSelector';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import { HomeIcon, Trophy, Users, LogIn, UserPlus, User } from 'lucide-react';

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlayer, setCurrentPlayer, setRoomId } = useGame();
  
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('/placeholder.svg');
  const [joinRoomId, setJoinRoomId] = useState<string>('');
  const [showJoinForm, setShowJoinForm] = useState<boolean>(false);

  // Initialize name from current player if available
  useEffect(() => {
    if (currentPlayer?.name) {
      setName(currentPlayer.name);
    }
    if (currentPlayer?.avatar) {
      setAvatar(currentPlayer.avatar);
    }
  }, [currentPlayer]);

  const handleCreateRoom = () => {
    if (name.trim() === '') {
      toast({
        title: 'Nom requis',
        description: 'Veuillez entrer un pseudo pour créer une partie',
        variant: 'destructive',
      });
      return;
    }
    
    const roomId = generateRoomId();
    const player = {
      id: currentPlayer?.id || Math.random().toString(36).substring(2, 10),
      name,
      avatar,
      score: 0,
      isHost: true,
      isEliminated: false,
      ...currentPlayer, // Keep existing player data if logged in
    };
    
    setCurrentPlayer(player);
    setRoomId(roomId);
    navigate(`/waiting-room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (name.trim() === '') {
      toast({
        title: 'Nom requis',
        description: 'Veuillez entrer un pseudo pour rejoindre une partie',
        variant: 'destructive',
      });
      return;
    }

    if (joinRoomId.trim() === '') {
      toast({
        title: 'Code requis',
        description: 'Veuillez entrer un code de salle pour rejoindre une partie',
        variant: 'destructive',
      });
      return;
    }
    
    const player = {
      id: currentPlayer?.id || Math.random().toString(36).substring(2, 10),
      name,
      avatar,
      score: 0,
      isHost: false,
      isEliminated: false,
      ...currentPlayer, // Keep existing player data if logged in
    };
    
    setCurrentPlayer(player);
    setRoomId(joinRoomId);
    navigate(`/waiting-room/${joinRoomId}`);
  };

  const toggleJoinForm = () => {
    setShowJoinForm(!showJoinForm);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-game-blue via-game-purple to-game-red">
      <BackgroundShapes />
      
      <header className="w-full py-4 px-6 flex justify-end items-center z-10">
        <div className="space-x-2">
          {currentPlayer?.email ? (
            <Button 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5 mr-2" />
              Mon profil
            </Button>
          ) : (
            <>
              <Button 
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white"
                onClick={() => navigate('/signin')}
              >
                <LogIn className="h-5 w-5 mr-2" />
                Connexion
              </Button>
              <Button 
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white"
                onClick={() => navigate('/signup')}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Inscription
              </Button>
            </>
          )}
        </div>
      </header>
      
      <div className="game-container flex flex-col flex-grow items-center justify-center py-10 md:py-16 z-10">
        <div className="text-center mb-8 animate-bounce-in">
          <h1 className="font-bold text-4xl md:text-6xl mb-3 text-white text-shadow-lg">Les 12 Coups du Web</h1>
          <p className="text-lg md:text-xl text-white/90">
            Testez vos connaissances dans ce quiz multijoueur inspiré du jeu TV !
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 animate-zoom-in border border-accent/50">
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <Avatar className="w-24 h-24 border-4 border-primary">
                  <AvatarImage src={avatar} alt="Avatar" />
                  <AvatarFallback className="bg-muted">
                    {name.substring(0, 2).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Votre pseudo
              </label>
              <Input 
                id="name"
                placeholder="Entrez votre pseudo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-4 border-accent/30 focus-visible:ring-primary"
              />
              
              <label className="block text-sm font-medium mb-2">
                Choisissez votre avatar
              </label>
              <AvatarSelector onSelect={setAvatar} selectedAvatar={avatar} />
            </div>
            
            {!showJoinForm ? (
              <div className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-game-purple to-game-blue hover:opacity-90 text-white shadow-lg"
                  onClick={handleCreateRoom}
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Créer une partie
                </Button>
                
                <Button 
                  className="w-full bg-gradient-to-r from-game-orange to-game-yellow hover:opacity-90 text-white shadow-lg" 
                  onClick={toggleJoinForm}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Rejoindre une partie
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <label htmlFor="roomCode" className="block text-sm font-medium mb-2">
                  Code de la salle
                </label>
                <Input 
                  id="roomCode"
                  placeholder="Entrez le code à 6 caractères"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  className="uppercase border-accent/30 focus-visible:ring-primary"
                  maxLength={6}
                />
                
                <Button 
                  className="w-full bg-gradient-to-r from-game-purple to-game-blue hover:opacity-90 text-white shadow-lg"
                  onClick={handleJoinRoom}
                >
                  Rejoindre
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={toggleJoinForm}
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Retour
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
