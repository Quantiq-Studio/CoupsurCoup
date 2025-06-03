import { Routes, Route, Navigate } from "react-router-dom";
import {useGame} from "@/context/GameContext.tsx";
import HomePage from "@/pages/HomePage";
import WaitingRoom from "@/pages/WaitingRoom.tsx";
import QuizRound1 from "@/pages/QuizRound1.tsx";
import QuizRound3 from "@/pages/QuizRound3.tsx";
import QuizRound5 from "@/pages/QuizRound5.tsx";
import DuelPage from "@/pages/DuelPage.tsx";
import FinalGrid from "@/pages/FinalGrid.tsx";
import ResultsPage from "@/pages/ResultsPage.tsx";
import ProfilePage from "@/pages/ProfilePage.tsx";
import SignInPage from "@/pages/SignInPage.tsx";
import SignUpPage from "@/pages/SignUpPage.tsx";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage.tsx";
import BadgesPage from "@/pages/BadgesPage.tsx";
import ChallengesPage from "@/pages/ChallengesPage.tsx";
import ShopPage from "@/pages/ShopPage.tsx";
import LeaderboardPage from "@/pages/LeaderboardPage.tsx";
import NotFound from "@/pages/NotFound.tsx";
import DuelSelectPage from "@/pages/DuelSelectPage.tsx";


const AppRoutes = () => {
    const { currentPlayer } = useGame();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/waiting-room/:roomId" element={<WaitingRoom />} />
            <Route path="/round1/:roomId" element={<QuizRound1 />} />
            <Route path="/duel-select/:roomId/:challengerId" element={<DuelSelectPage />} />
            <Route path="/round3/:roomId" element={<QuizRound3 />} />
            <Route path="/duel/:roomId/:challengerId/:opponentId" element={<DuelPage />} />
            <Route path="/round5/:roomId" element={<QuizRound5 />} />
            <Route path="/results/:roomId" element={<ResultsPage />} />
            <Route path="/profile" element={
                currentPlayer?.email ? <ProfilePage /> : <Navigate to="/signin" replace />
            } />
            <Route
                path="/signin"
                element={
                    currentPlayer?.email ? <Navigate to="/profile" replace /> : <SignInPage />
                }
            />
            <Route
                path="/signup"
                element={
                    currentPlayer?.email ? <Navigate to="/profile" replace /> : <SignUpPage />
                }
            />
            <Route
                path="/forgot-password"
                element={
                    currentPlayer?.email ? <Navigate to="/profile" replace /> : <ForgotPasswordPage />
                }
            />
            <Route path="/badges" element={
                currentPlayer?.email ? <BadgesPage /> : <Navigate to="/signin" replace />
            } />
            <Route path="/challenges" element={
                currentPlayer?.email ? <ChallengesPage /> : <Navigate to="/signin" replace />
            } />
            <Route path="/shop" element={
                currentPlayer?.email ? <ShopPage /> : <Navigate to="/signin" replace />
            } />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;