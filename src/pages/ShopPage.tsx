
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import BackgroundShapes from '@/components/game/BackgroundShapes';
import { Coins, Home, ShoppingBag, UserCircle, Zap } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Mock shop items
const avatarItems = [
  { id: 'avatar-1', name: 'Avatar Premium 1', image: '/placeholder.svg', price: 50, type: 'avatar' },
  { id: 'avatar-2', name: 'Avatar Premium 2', image: '/placeholder.svg', price: 75, type: 'avatar' },
  { id: 'avatar-3', name: 'Avatar Premium 3', image: '/placeholder.svg', price: 100, type: 'avatar' },
  { id: 'avatar-4', name: 'Avatar Premium 4', image: '/placeholder.svg', price: 150, type: 'avatar' },
];

const boosterItems = [
  { 
    id: 'boost-1', 
    name: 'Boost XP 30min', 
    description: 'Double les points d\'expérience pendant 30 minutes', 
    price: 25, 
    type: 'booster',
    duration: '30 minutes',
    multiplier: 2
  },
  { 
    id: 'boost-2', 
    name: 'Boost XP 1h', 
    description: 'Double les points d\'expérience pendant 1 heure', 
    price: 45, 
    type: 'booster',
    duration: '1 heure',
    multiplier: 2
  },
  { 
    id: 'boost-3', 
    name: 'Boost Pièces 30min', 
    description: 'Double les pièces gagnées pendant 30 minutes', 
    price: 30, 
    type: 'booster',
    duration: '30 minutes',
    multiplier: 2
  },
];

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlayer, addCoins, setCurrentPlayer } = useGame();
  
  const handlePurchase = (item: any) => {
    if (!currentPlayer) return;
    
    if ((currentPlayer.coins || 0) < item.price) {
      toast({
        title: "Fonds insuffisants",
        description: "Vous n'avez pas assez de pièces pour cet achat",
        variant: "destructive",
      });
      return;
    }
    
    // Deduct coins
    addCoins(currentPlayer.id, -item.price);
    
    // Handle different item types
    if (item.type === 'avatar') {
      setCurrentPlayer({
        ...currentPlayer,
        avatar: item.image
      });
      
      toast({
        title: "Avatar acheté !",
        description: "Votre nouvel avatar a été appliqué",
      });
    } else if (item.type === 'booster') {
      toast({
        title: "Booster activé !",
        description: `Vous bénéficiez d'un multiplicateur x${item.multiplier} pendant ${item.duration}`,
      });
    }
  };
  
  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-game-gradient text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Connectez-vous</h1>
          <p className="mb-6">Vous devez être connecté pour accéder à la boutique</p>
          <Button onClick={() => navigate('/signin')}>Se connecter</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-game-gradient">
      <BackgroundShapes />
      
      <div className="game-container flex flex-col py-8 z-10">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 mr-2" />
            Accueil
          </Button>
          
          <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full flex items-center">
            <Coins className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="font-bold text-white">{currentPlayer.coins || 0}</span>
          </div>
        </div>

        <div className="text-center mb-8 animate-bounce-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Boutique</h1>
          <p className="text-xl text-white/80">Dépensez vos pièces gagnées !</p>
        </div>
        
        <Tabs defaultValue="avatars" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-white/20 text-white">
            <TabsTrigger value="avatars" className="data-[state=active]:bg-white/30  data-[state=active]:text-white">
              <UserCircle className="h-4 w-4 mr-2" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="boosters" className="data-[state=active]:bg-white/30 data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              Boosters
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="avatars" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {avatarItems.map(item => (
                <Card key={item.id} className="bg-white/95 backdrop-blur-sm border-accent/30 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 text-center">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src={item.image} alt={item.name} />
                      <AvatarFallback>AV</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg mt-2">{item.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-2 flex justify-between">
                    <div className="flex items-center text-amber-600 font-bold">
                      <Coins className="h-4 w-4 mr-1" />
                      {item.price}
                    </div>
                    <Button 
                      size="sm"
                      className="bg-accent hover:bg-accent/80 text-accent-foreground"
                      onClick={() => handlePurchase(item)}
                      disabled={(currentPlayer.coins || 0) < item.price}
                    >
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      Acheter
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="boosters" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {boosterItems.map(item => (
                <Card key={item.id} className="bg-white/95 backdrop-blur-sm border-accent/30 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                      {item.name}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-2 rounded-md text-sm">
                      <div className="flex justify-between">
                        <span>Durée :</span>
                        <span className="font-medium">{item.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Multiplicateur :</span>
                        <span className="font-medium">x{item.multiplier}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center text-amber-600 font-bold">
                      <Coins className="h-4 w-4 mr-1" />
                      {item.price}
                    </div>
                    <Button 
                      className="bg-accent hover:bg-accent/80 text-accent-foreground"
                      onClick={() => handlePurchase(item)}
                      disabled={(currentPlayer.coins || 0) < item.price}
                    >
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      Acheter
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShopPage;
