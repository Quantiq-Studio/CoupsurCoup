import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }     from 'react-router-dom';
import { useGame }                    from '@/context/GameContext';
import { useGameRealtime }            from '@/hooks/useGameRealtime';
import { HomeIcon, PlayIcon, TimerIcon, User, AlertTriangle } from 'lucide-react';
import { useToast }          from '@/hooks/use-toast';
import { account, databases } from '@/lib/appwrite';
import { Query }             from 'appwrite';
import {Button} from "@/components/ui/button.tsx";
import {GameTitle} from "@/components/ui/game-title.tsx";
import CopyToClipboard from "@/components/game/CopyToClipboard.tsx";
import LoadingSpinner from "@/components/game/LoadingSpinner.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {generateBots} from "@/lib/utils/generateBots.ts";

const DATABASE_ID            = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const GAMES_COLLECTION_ID    = import.meta.env.VITE_APPWRITE_GAMES_COLLECTION_ID;
const PLAYERS_COLLECTION_ID  = import.meta.env.VITE_APPWRITE_PLAYERS_COLLECTION_ID;
const MIN_PLAYERS            = 4;

const WaitingRoom: React.FC = () => {
  const navigate           = useNavigate();
  const { roomId }         = useParams<{ roomId: string }>();
  useGameRealtime(roomId);                          // 📡 temps-réel
  const { toast }          = useToast();

  const {
    currentPlayer,
    players,
    setCurrentRound,
    setCurrentQuestionIndex,
    loadQuestions,
  } = useGame();

  /* ---------------- Heartbeat ---------------- */
  useEffect(() => {
    if (!currentPlayer?.id) return;
    const id = setInterval(() => {
      console.log('[waiting] heartbeat update lastSeenAt', currentPlayer?.id);
      databases.updateDocument(
          DATABASE_ID,
          PLAYERS_COLLECTION_ID,
          currentPlayer.id,
          { lastSeenAt: new Date().toISOString() }
      ).catch(() => {});
    }, 2000);
    return () => clearInterval(id);
  }, [currentPlayer]);

  /* ------------ loading spinner -------------- */
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    console.log('[waiting] players changed →', players);
    setIsLoading(players.length === 0);
  }, [players, currentPlayer]);

  /* -------------- quitter la salle ----------- */
  const handleQuit = async () => {
    console.log('[waiting] handleQuit() currentPlayer', currentPlayer?.id);
    if (!currentPlayer || !roomId) return;

    try {
      const res = await databases.listDocuments(DATABASE_ID, GAMES_COLLECTION_ID, [
        Query.equal("roomId", roomId),
      ]);
      const game = res.documents[0];
      console.log(game);
      if (!game) throw new Error("Partie introuvable");

      // 1. Supprimer le joueur du tableau playerIds
      const updatedPlayerIds = game.playerIds.filter((id: string) => id !== currentPlayer.id);


      // 2. Si plus aucun joueur humain → supprimer la partie
      const stillConnected = await Promise.all(
          updatedPlayerIds.map((id: string) =>
              databases.getDocument(DATABASE_ID, PLAYERS_COLLECTION_ID, id).catch(() => null)
          )
      );

      const activeHumans = stillConnected.filter(p => p && p.lastSeenAt).filter(p => {
        const secondsAgo = (Date.now() - new Date(p.lastSeenAt).getTime()) / 1000;
        return secondsAgo < 10;
      });

      if (activeHumans.length === 0) {
        console.log("Aucun joueur actif, suppression de la partie");
        console.log(DATABASE_ID, GAMES_COLLECTION_ID, game.$id);
        await databases.updateDocument(DATABASE_ID, GAMES_COLLECTION_ID, game.$id, {
            playerIds: updatedPlayerIds,
            status: "finished",
        });
      } else if (currentPlayer.id === game.hostId) {
        // 3. Si l'hôte part, transférer à un joueur actif
        const newHost = activeHumans[0];
        await databases.updateDocument(DATABASE_ID, GAMES_COLLECTION_ID, game.$id, {
          playerIds: updatedPlayerIds,
          hostId: newHost.$id,
        });
      } else {
        await databases.updateDocument(DATABASE_ID, GAMES_COLLECTION_ID, game.$id, {
          playerIds: updatedPlayerIds,
        });
      }

      try {
        const s = await account.getSession('current');
        if (s.provider === 'anonymous') {
          await account.deleteSession('current');
        }
      } catch {
        // Si la session est déjà supprimée, on ignore l'erreur
      }


      navigate('/');
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Erreur',
        description: err.message || "Impossible de quitter la partie.",
        variant: 'destructive',
      });
    }
  };

  /* -------------- lancer la partie ----------- */
  const startGame = async () => {
    console.log('[waiting] startGame() called by host');
    try {
      const { documents } = await databases.listDocuments(
          DATABASE_ID,
          GAMES_COLLECTION_ID,
          [Query.equal('roomId', roomId)]
      );
      const game = documents[0];
      if (!game) throw new Error('Partie introuvable');

      console.log('[waiting] loading questions…');
      const questionIds = await loadQuestions();
      console.log('[waiting] questionIds =', questionIds);

      if (!game.bots || game.bots.length === 0) {
        const generated = generateBots(Math.max(0, MIN_PLAYERS - game.playerIds.length));
        await databases.updateDocument(
            DATABASE_ID,
            GAMES_COLLECTION_ID,
            game.$id,
            { bots: generated }
        );
      }

      await databases.updateDocument(DATABASE_ID, GAMES_COLLECTION_ID, game.$id, {
        status: 'playing',
        round: 1,
        currentQuestionIndex: 0,
        questions: questionIds,
        activePlayerId: game.playerIds[0],  // NEW
        timeRemaining: 10,
      });

      // 👉 on ne fait plus de navigate : le realtime redirigera tout le monde
      setCurrentRound(1);
      setCurrentQuestionIndex(0);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de démarrer la partie',
        variant: 'destructive',
      });
    }
  };

  /* -------------------- UI ------------------- */
  return (
      <div className="min-h-screen bg-gradient-to-br from-game-blue via-game-purple to-game-red flex flex-col">
        <div className="game-container flex flex-col flex-grow py-8">
          {/* header */}
          <div className="flex justify-between items-center mb-8">
            <Button
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
                onClick={handleQuit}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Quitter
            </Button>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white">
              <User className="h-4 w-4" />
              <span className="font-medium">{players.length} joueurs</span>
            </div>
          </div>

          {/* titre / code salle */}
          <div className="text-center mb-8 animate-bounce-in">
            <GameTitle>Salle d'attente</GameTitle>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <p className="text-xl text-white">Code de la salle :</p>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 py-2 px-6 rounded-lg font-mono text-xl font-bold tracking-wider text-white">
                  {roomId}
                </div>
                <CopyToClipboard text={roomId ?? ''} />
              </div>
            </div>
          </div>

          {/* contenu */}
          {isLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-white">Chargement des joueurs...</p>
              </div>
          ) : (
              <>
                {/* liste joueurs */}
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

                          {!player.isBot && (
                              <p className="font-medium text-center text-white">{player.name}</p>
                          )}

                          {player.isHost && (
                              <span className="text-xs mt-1 py-1 px-2 bg-accent/50 rounded-full">Hôte</span>
                          )}
                          {player.isBot && (
                              <span className="text-xs py-1 px-2 bg-white/20 text-white rounded-full mt-1">
                        Bot
                      </span>
                          )}
                        </div>
                    ))}
                  </div>

                  {players.length < MIN_PLAYERS && (
                      <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-white">Attention</h3>
                          <p className="text-white">
                            Il faut au moins {MIN_PLAYERS} joueurs pour commencer. Actuellement {players.length}.
                          </p>
                        </div>
                      </div>
                  )}
                </div>

                {/* info attente */}
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm mb-8">
                  <h2 className="text-xl font-medium mb-4 flex items-center text-white">
                    <TimerIcon className="h-5 w-5 mr-2" />
                    En attendant...
                  </h2>
                  <p className="text-white">
                    Préparez-vous à affronter d'autres joueurs dans une série d'épreuves !
                  </p>
                </div>

                {/* bouton start */}
                <div className="mt-auto text-center">
                  {players.find(p => p.isHost)?.id === currentPlayer?.id ? (
                      <Button
                          className="bg-gradient-to-r from-game-yellow to-game-red hover:opacity-90 text-lg py-4 px-10 shadow-lg"
                          onClick={startGame}
                          disabled={players.length < MIN_PLAYERS}
                      >
                        <PlayIcon className="h-5 w-5 mr-2" />
                        {players.length < MIN_PLAYERS
                            ? `En attente (${players.length}/${MIN_PLAYERS})`
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