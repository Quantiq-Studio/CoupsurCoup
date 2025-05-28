import { useEffect, useState } from 'react';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';

export const useQuestions = (type: string) => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const response = await databases.listDocuments(
                    import.meta.env.VITE_APPWRITE_DB_ID!,
                    import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID!,
                    [Query.equal('type', type), Query.limit(60)]
                );
                setQuestions(response.documents);
            } catch (err) {
                console.error('❌ Erreur de récupération des questions :', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [type]);

    return { questions, loading };
};