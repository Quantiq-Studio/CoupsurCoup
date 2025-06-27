import { Models } from 'appwrite';
import {Achievement, Badge, Challenge, PlayerStatus} from "@/context/GameTypes.ts";

export interface PlayerDoc extends Models.Document {
    /* alias pour satisfaire Player ----------------------------------- */
    id: string;          //  <== NEW   (sera = $id)
    /* vos champs existants ------------------------------------------- */
    name: string;
    avatar: string;
    score: number;
    isHost: boolean;
    isEliminated: boolean;
    status?: PlayerStatus;
    coins: number;
    isBot?: boolean;
    isAnonymous?: boolean;

    // Additional properties for authenticated users
    email?: string;
    totalScore?: number;
    gamesPlayed?: number;
    gamesWon?: number;

    // Gamification properties
    level?: number;
    experience?: number;
    badges?: Badge[];
    achievements?: Achievement[];
    challengesCompleted?: Challenge[];
    streakDays?: number;
    lastLoginDate?: string;
}