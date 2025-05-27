import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useToast } from '@/hooks/use-toast';
import AvatarSelector from '@/components/game/AvatarSelector';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import { HomeIcon, Trophy, Users } from 'lucide-react';
import { GameHeader } from '@/components/ui/game-header';
import { GameTitle } from '@/components/ui/game-title';
import { GameInput } from '@/components/ui/game-input';
import { GameButton } from '@/components/ui/game-button';
import { GameCard } from '@/components/ui/game-card';
import { GameAvatar } from '@/components/ui/game-avatar';
import { account, databases } from "@/lib/appwrite.ts";
import { ID, Query } from "appwrite";

const GAMES_COLLECTION_ID = '68308f180030b8019d46';
const PLAYERS_COLLECTION_ID = '68308f130020e76ceeec';
const DATABASE_ID = '68308ece00320290574e';

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlayer, setCurrentPlayer, setRoomId } = useGame();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    if (currentPlayer?.name) setName(currentPlayer.name);
    if (currentPlayer?.avatar) setAvatar(currentPlayer.avatar);
  }, [currentPlayer]);

  const ensureSession = async () => {
    try {
      await account.get();
    } catch {
      // Si aucune session n'existe, on en crée une anonyme
      await account.createAnonymousSession();
    }
  };

  const createAnonymousPlayer = async (name: string, avatar: string) => {
    const player = await account.get()
    const playerId = player.$id;
    await databases.createDocument(DATABASE_ID, PLAYERS_COLLECTION_ID, playerId, {
      name,
      avatar,
      coins: 0,
      score: 0,
      level: 1,
      experience: 0,
      isBot: false,
      isAnonymous: true,
      lastSeenAt: new Date().toISOString(),
    });

    return {
      id: playerId,
      name,
      avatar,
      score: 0,
      isHost: false,
      isEliminated: false,
      coins: 0,
      level: 1,
      experience: 0,
      isBot: false,
      isAnonymous: true,
      lastSeenAt: new Date().toISOString(),
    };
  };

  const handleCreateRoom = async () => {
    if (name.trim() === '') {
      toast({
        title: 'Nom requis',
        description: 'Veuillez entrer un pseudo pour créer une partie',
        variant: 'destructive',
      });
      return;
    }

    await ensureSession();

    const roomId = generateRoomId();
    let player;

    if (currentPlayer?.email) {
      player = { ...currentPlayer, isHost: true, isEliminated: false };
    } else {
      player = await createAnonymousPlayer(name, avatar);
      player.isHost = true;
      player.isEliminated = false;
    }

    try {
      await databases.createDocument(DATABASE_ID, GAMES_COLLECTION_ID, roomId, {
        roomId,
        hostId: player.id,
        playerIds: [player.id],
        status: 'waiting',
        round: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Erreur création de game :', err);
      toast({
        title: 'Erreur serveur',
        description: 'Impossible de créer la partie. Réessaye.',
        variant: 'destructive',
      });
      return;
    }

    setCurrentPlayer(player);
    setRoomId(roomId);
    navigate(`/waiting-room/${roomId}`);
  };

  const handleJoinRoom = async () => {
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

    await ensureSession();

    let player;

    if (currentPlayer?.email) {
      player = { ...currentPlayer, isHost: false, isEliminated: false };
    } else {
      player = await createAnonymousPlayer(name, avatar);
    }

    const games = await databases.listDocuments(
        DATABASE_ID,
        GAMES_COLLECTION_ID,
        [Query.equal("roomId", joinRoomId)]
    );

    const game = games.documents[0];

    if (!game) {
      toast({
        title: 'Salle introuvable',
        description: 'Aucune salle ne correspond à ce code.',
        variant: 'destructive',
      });
      return;
    }

    if (game.status !== 'waiting') {
      toast({
        title: 'Partie inaccessible',
        description: 'Cette partie a déjà commencé ou est terminée.',
        variant: 'destructive',
      });
      return;
    }

    await databases.updateDocument(
        DATABASE_ID,
        GAMES_COLLECTION_ID,
        game.$id,
        {
          playerIds: [...game.playerIds, player.id]
        }
    );

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

        <GameHeader showHomeButton={false} />

        <div className="game-container flex flex-col flex-grow items-center justify-center py-10 md:py-16 z-10">
          <GameTitle
              className="mb-8 animate-bounce-in"
              subtitle="Testez vos connaissances dans ce quiz multijoueur inspiré du jeu TV !"
          >
            Le Coup sur Coup
          </GameTitle>

          <div className="w-full max-w-md mx-auto">
            <GameCard className="animate-zoom-in">
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <GameAvatar
                      src={avatar}
                      name={name}
                      size="xl"
                      bordered
                  />
                </div>

                <GameInput
                    label="Votre pseudo"
                    placeholder="Entrez votre pseudo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    containerClassName="mb-4"
                    disabled={!!currentPlayer?.email}
                />

                {!currentPlayer?.email && (
                    <>
                      <label className="block text-sm font-medium mb-2">
                        Choisissez votre avatar
                      </label>
                      <AvatarSelector onSelect={setAvatar} selectedAvatar={avatar} />
                    </>
                )}
              </div>

              {!showJoinForm ? (
                  <div className="space-y-4">
                    <GameButton
                        variant="primary"
                        className="w-full"
                        onClick={handleCreateRoom}
                    >
                      <Trophy className="h-5 w-5 mr-2" />
                      Créer une partie
                    </GameButton>

                    <GameButton
                        variant="secondary"
                        className="w-full"
                        onClick={toggleJoinForm}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Rejoindre une partie
                    </GameButton>
                  </div>
              ) : (
                  <div className="space-y-4">
                    <GameInput
                        label="Code de la salle"
                        placeholder="Entrez le code à 6 caractères"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="uppercase"
                    />

                    <GameButton
                        variant="primary"
                        className="w-full"
                        onClick={handleJoinRoom}
                    >
                      Rejoindre
                    </GameButton>

                    <GameButton
                        variant="accent"
                        className="w-full"
                        onClick={toggleJoinForm}
                    >
                      <HomeIcon className="h-5 w-5 mr-2" />
                      Retour
                    </GameButton>
                  </div>
              )}
            </GameCard>
          </div>
        </div>
      </div>
  );
};

export default HomePage;
