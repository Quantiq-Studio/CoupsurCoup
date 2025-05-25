import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import CopyToClipboard from '@/components/game/CopyToClipboard';
import LoadingSpinner from '@/components/game/LoadingSpinner';
import { HomeIcon, PlayIcon, TimerIcon, User, AlertTriangle } from 'lucide-react';
import { GameTitle } from "@/components/ui/game-title";
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

const GAMES_COLLECTION_ID = '68308f180030b8019d46';
const PLAYERS_COLLECTION_ID = '68308f130020e76ceeec';
const DATABASE_ID = '68308ece00320290574e';
const MIN_PLAYERS = 4;

const generateBots = (count: number) => {
  const allNames = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Nina', 'Oscar', 'Paul', 'Quinn', 'Rita', 'Sam', 'Tina'];
  const shuffled = allNames.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((name, i) => ({
    id: `bot-${i + 1}`,
    name,
    avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=bot${i + 1}`,
    score: 0,
    isHost: false,
    isEliminated: false,
    coins: 1000,
    isBot: true,
  }));
};

const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { toast } = useToast();
  const {
    currentPlayer,
    players,
    setPlayers,
    setCurrentRound,
    setCurrentQuestionIndex
  } = useGame();

  const [isLoading, setIsLoading] = useState(true);
  const [generatedBots, setGeneratedBots] = useState<any[]>([]);
  const [previousPlayerIds, setPreviousPlayerIds] = useState<string[]>([]);

  let bots: any[] = generatedBots;

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(() => {
      fetchPlayers();
    }, 1000);
    return () => clearInterval(interval);
  }, [roomId, currentPlayer]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (!currentPlayer?.id) return;
      databases.updateDocument(DATABASE_ID, PLAYERS_COLLECTION_ID, currentPlayer.id, {
        lastSeenAt: new Date().toISOString(),
      }).catch(() => {});
    }, 1000); // toutes les 1 secondes

    return () => clearInterval(heartbeat);
  }, [currentPlayer]);

  const fetchPlayers = async () => {
    if (!roomId || !currentPlayer) {
      navigate('/');
      return;
    }

    try {
      const res = await databases.listDocuments(DATABASE_ID, GAMES_COLLECTION_ID, [
        Query.equal("roomId", roomId),
      ]);
      const game = res.documents[0];
      if (!game) throw new Error("Game introuvable");

      const playerDocs = await Promise.all(
          game.playerIds.map((id: string) =>
              databases.getDocument(DATABASE_ID, PLAYERS_COLLECTION_ID, id).catch(() => null)
          )
      );

      const realPlayers = playerDocs
          .filter(Boolean)
          .filter((doc: any) => {
            if (!doc.lastSeenAt) return false;
            const lastSeen = new Date(doc.lastSeenAt);
            const now = new Date();
            const secondsAgo = (now.getTime() - lastSeen.getTime()) / 1000;
            return secondsAgo < 2;
          })
          .map((doc: any) => ({
            id: doc.$id,
            name: doc.name,
            avatar: doc.avatar,
            score: doc.score || 0,
            coins: doc.coins || 0,
            isHost: doc.$id === game.hostId,
            isEliminated: false,
            isBot: false,
          }));

      const currentIds = realPlayers.map(p => p.id);
      const leftPlayers = previousPlayerIds.filter(id => !currentIds.includes(id));
      if (leftPlayers.length > 0) {
        toast({
          title: 'Un joueur a quitté',
          description: 'Un ou plusieurs joueurs se sont déconnectés de la salle.',
        });
      }

      setPreviousPlayerIds(currentIds);
      const neededBots = Math.max(0, MIN_PLAYERS - realPlayers.length);

      if (bots.length !== neededBots) {
        bots = generateBots(neededBots);
        setGeneratedBots(bots);
      }

      setPlayers([...realPlayers, ...bots.slice(0, neededBots)]);
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de charger la salle',
        variant: 'destructive',
      });
      navigate('/');
    }
  };

  const startGame = async () => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, GAMES_COLLECTION_ID, [
        Query.equal("roomId", roomId),
      ]);
      const game = res.documents[0];
      if (!game) throw new Error("Partie introuvable");

      // 1. On filtre les joueurs humains (hors bots)
      const realPlayers = players.filter(p => !p.isBot);

      // 2. On s’assure que currentPlayer est inclus
      const isIncluded = realPlayers.some(p => p.id === currentPlayer?.id);
      if (!isIncluded && currentPlayer) {
        realPlayers.push(currentPlayer);
      }

      // 3. Vérifie qu’on atteint MIN_PLAYERS humains (sans les bots)
      if (realPlayers.length < MIN_PLAYERS) {
        toast({
          title: 'Pas assez de joueurs',
          description: `Il faut au moins ${MIN_PLAYERS} joueurs humains pour commencer la partie.`,
          variant: 'destructive',
        });
        return;
      }

      // 4. Génère les bots restants s’il en faut
      const neededBots = Math.max(0, MIN_PLAYERS - realPlayers.length);
      const botsToAdd = generateBots(neededBots);

      // 5. Mise à jour du state
      setPlayers([...realPlayers, ...botsToAdd]);

      // 6. Mise à jour du document game
      await databases.updateDocument(DATABASE_ID, GAMES_COLLECTION_ID, game.$id, {
        status: "playing",
        round: 1,
        currentQuestionIndex: 0,
      });

      setCurrentRound(1);
      setCurrentQuestionIndex(0);
      navigate(`/round1/${roomId}`);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de démarrer la partie",
        variant: "destructive",
      });
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-game-blue via-game-purple to-game-red flex flex-col">
        <div className="game-container flex flex-col flex-grow py-8">
          <div className="flex justify-between items-center mb-8">
            <Button
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
                onClick={() => navigate('/')}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Quitter
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white">
              <User className="h-4 w-4" />
              <span className="font-medium">{players.length} joueurs</span>
            </div>
          </div>

          <div className="text-center mb-8 animate-bounce-in">
            <GameTitle>Salle d'attente</GameTitle>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <p className="text-xl text-white">Code de la salle:</p>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 py-2 px-6 rounded-lg font-mono text-xl font-bold tracking-wider text-white">
                  {roomId}
                </div>
                <CopyToClipboard text={roomId || ''} />
              </div>
            </div>
          </div>

          {isLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-white">Chargement des joueurs...</p>
              </div>
          ) : (
              <>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm mb-8 animate-zoom-in">
                  <h2 className="text-xl font-medium mb-4 flex items-center text-white">
                    <User className="h-5 w-5 mr-2" />
                    Joueurs connectés ({players.length})
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {players.map(player => (
                        <div
                            key={player.id}
                            className={`flex flex-col items-center p-3 rounded-lg ${
                                player.isHost ? 'bg-accent/30 ring-2 ring-accent' : 'bg-white/10'
                            }`}
                        >
                          <Avatar className="w-16 h-16 mb-2 border-2 border-white/50">
                            <AvatarImage src={player.avatar} alt={player.name} />
                            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium text-center text-white">{player.name}</p>
                          {player.isHost && <span className="text-xs mt-1 py-1 px-2 bg-accent/50 rounded-full">Hôte</span>}
                          {player.isBot && <span className="text-xs py-1 px-2 bg-white/20 text-white rounded-full mt-1">Bot</span>}
                        </div>
                    ))}
                  </div>

                  {players.length < MIN_PLAYERS && (
                      <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-white">Attention</h3>
                          <p className="text-white">Il faut au moins {MIN_PLAYERS} joueurs pour commencer. Actuellement {players.length} joueur(s).</p>
                        </div>
                      </div>
                  )}
                </div>

                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm mb-8">
                  <h2 className="text-xl font-medium mb-4 flex items-center text-white">
                    <TimerIcon className="h-5 w-5 mr-2" />
                    En attendant...
                  </h2>
                  <p className="text-white">
                    Préparez-vous à affronter d'autres joueurs dans une série d'épreuves ! Le dernier debout accédera à l’épreuve finale.
                  </p>
                </div>

                <div className="mt-auto text-center">
                  {currentPlayer?.isHost ? (
                      <Button
                          className="bg-gradient-to-r from-game-yellow to-game-red hover:opacity-90 text-lg py-4 px-10 shadow-lg"
                          onClick={startGame}
                          disabled={players.length < MIN_PLAYERS}
                      >
                        <PlayIcon className="h-5 w-5 mr-2" />
                        {players.length < MIN_PLAYERS
                            ? `En attente de joueurs (${players.length}/${MIN_PLAYERS})`
                            : 'Lancer la partie'}
                      </Button>
                  ) : (
                      <div className="animate-pulse text-white">
                        <p>En attente du lancement par l'hôte...</p>
                      </div>
                  )}
                </div>
              </>
          )}
        </div>
      </div>
  );
};

export default WaitingRoom;
