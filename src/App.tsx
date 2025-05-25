import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "./context/GameContext";
import AuthRestorer from "@/components/AuthRestorer.tsx";
import AppRoutes from "@/routes/AppRoutes.tsx";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <AuthRestorer />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <AppRoutes />
            </div>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;