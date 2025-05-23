import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { GameHeader } from '@/components/ui/game-header';
import { GameButton } from '@/components/ui/game-button';
import { Card } from '@/components/ui/card';
import AvatarSelector from '@/components/game/AvatarSelector';
import { GameInput } from '@/components/ui/game-input';
import CopyToClipboard from '@/components/game/CopyToClipboard';
import PlayerStatus from '@/components/game/PlayerStatus';
import BackgroundShapes from '@/components/game/BackgroundShapes';

const WaitingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { players, addPlayer, setCurrentPlayer, setRoomId } = useGame();
  
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar-1.png');
  const [joined, setJoined] = useState(false);
  
  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
    }
  }, [roomId, setRoomId]);
  
  // Check if there's already a host
  const hostExists = players.some(player => player.isHost);
  
  const handleJoinGame = () => {
    if (playerName.trim()) {
      // Add player to the game
      const newPlayer = {
        id: `player-${Date.now()}`,
        name: playerName,
        avatar: selectedAvatar,
        score: 0,
        isHost: !hostExists, // First player becomes host
        isEliminated: false,
        coins: 1000 // Initialize with 1000 coins
      };
      
      addPlayer(newPlayer);
      setCurrentPlayer(newPlayer);
      setJoined(true);
    }
  };
  
  const handleStartGame = () => {
    if (roomId) {
      navigate(`/round1/${roomId}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-blue-900 to-violet-800">
      <BackgroundShapes />
      
      <div className="container mx-auto px-4 py-8">
        <GameHeader showHomeButton={true} />
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <h2 className="text-2xl font-bold">Code du salon: {roomId}</h2>
                <CopyToClipboard 
                  text={`${window.location.origin}/join/${roomId}`}
                  message="Lien d'invitation copié!"
                />
              </div>
              
              {!joined ? (
                <div className="space-y-6 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold">Rejoindre la partie</h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Votre pseudo</label>
                    <GameInput
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Entrez votre pseudo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Choisissez un avatar</label>
                    <AvatarSelector 
                      selected={selectedAvatar}
                      onSelect={setSelectedAvatar}
                    />
                  </div>
                  
                  <GameButton 
                    variant="primary" 
                    className="w-full" 
                    onClick={handleJoinGame}
                    disabled={!playerName.trim()}
                  >
                    Rejoindre
                  </GameButton>
                </div>
              ) : (
                <div className="text-center mb-8">
                  <p className="text-lg mb-2">En attente d'autres joueurs...</p>
                  <p className="text-sm text-gray-300 mb-6">La partie commencera lorsque l'hôte la lancera</p>
                  
                  {players.some(p => p.isHost && p.id === players.find(p => p === players.find(p => p.name === playerName))?.id) && (
                    <GameButton 
                      variant="primary"
                      onClick={handleStartGame}
                      disabled={players.length < 1} // Typically you'd want at least 2 players
                    >
                      Lancer la partie
                    </GameButton>
                  )}
                </div>
              )}
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Joueurs ({players.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {players.map((player) => (
                    <PlayerStatus 
                      key={player.id}
                      player={player}
                      showHost
                      showCoins
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
