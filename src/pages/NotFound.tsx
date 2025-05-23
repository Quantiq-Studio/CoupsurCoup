import { useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import BackgroundShapes from "@/components/game/BackgroundShapes.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Home} from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-game-blue via-game-purple to-game-red">
        <BackgroundShapes />
        <div className="game-container flex flex-col flex-grow items-center justify-center py-10 md:py-16 z-10">
        <h1 className="text-4xl font-bold mb-4 text-white animate-pulse">404</h1>
        <p className="text-xl mb-4 text-white">Oups ! La page que tu cherches n'existe pas</p>
          <Button
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white hover:text-white"
              onClick={() => window.location.href = "/"}
          >
           Retour à l'accueil
          </Button>
      </div>
    </div>
  );
};

export default NotFound;
