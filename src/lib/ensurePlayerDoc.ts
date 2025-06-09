// src/lib/ensurePlayerDoc.ts
import { databases } from '@/lib/appwrite';
import { ID }        from 'appwrite';

const DB  = '68308ece00320290574e';
const COL = '68308f130020e76ceeec';

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