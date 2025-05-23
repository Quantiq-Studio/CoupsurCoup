
import React from 'react';
import { CoinCounter } from '@/components/ui/coin-counter';
import { useGame } from '@/context/GameContext';
import { Player } from '@/context/GameTypes';

interface CoinTransactionListProps {
  playerId?: string;  // Si fourni, filtre les transactions pour un joueur spécifique
  limit?: number;     // Limite le nombre de transactions affichées
  compact?: boolean;  // Affiche une version compacte
}

const CoinTransactionList: React.FC<CoinTransactionListProps> = ({
  playerId,
  limit = 5,
  compact = false
}) => {
  const { coinTransactions, players } = useGame();
  
  // Filtrer les transactions si nécessaire
  const filteredTransactions = playerId 
    ? coinTransactions.filter(tx => tx.playerId === playerId)
    : coinTransactions;
    
  // Récupérer les transactions les plus récentes
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
    
  // Fonction pour obtenir le nom du joueur
  const getPlayerName = (id: string): string => {
    const player = players.find(p => p.id === id);
    return player?.name || 'Joueur inconnu';
  };
  
  if (recentTransactions.length === 0) {
    return (
      <div className="text-center p-4 bg-white/10 rounded-lg">
        <p className="text-gray-300">Aucune transaction</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {recentTransactions.map(transaction => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
        >
          <div>
            {!compact && !playerId && (
              <p className="text-sm font-medium">{getPlayerName(transaction.playerId)}</p>
            )}
            <p className="text-sm text-gray-300">{transaction.reason}</p>
            <p className="text-xs text-gray-400">
              {new Date(transaction.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <CoinCounter 
            value={0} 
            change={transaction.amount} 
            size={compact ? "sm" : "md"}
          />
        </div>
      ))}
    </div>
  );
};

export default CoinTransactionList;
