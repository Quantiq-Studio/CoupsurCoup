import { Models } from 'appwrite';

export interface PlayerDoc extends Models.Document {
    name: string;
    avatar: string;
    coins?: number;
    score?: number;
    lastSeenAt: string;
}