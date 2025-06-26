// src/lib/ensurePlayerDoc.ts
import { databases } from '@/lib/appwrite';
import { ID }        from 'appwrite';

const DB  = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL = import.meta.env.VITE_APPWRITE_PLAYERS_COLLECTION_ID;

export const ensurePlayerDoc = async (user: { $id: string; name?: string }) => {
    try {
        return await databases.getDocument(DB, COL, user.$id);
    } catch {
        return await databases.createDocument(
            DB,
            COL,
            user.$id,
            {
                name : user.name ?? 'Anonyme',
                avatar: '',
                score : 0,
                coins : 1000,
                level : 1,
                experience: 0,
            },
            []            // permissions par défaut
        );
    }
};