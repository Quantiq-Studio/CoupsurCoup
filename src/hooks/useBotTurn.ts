import { useEffect } from 'react';

type Params = {
    isBotTurn: boolean;                 // activePlayer?.isBot && … logique
    answer: (index: number) => void;    // callback pour valider la réponse
    correctIndex: number;               // index correct pour la question
    nbOptions: number;                  // longueur du tableau d’options
    successRate?: number;               // défaut 0.7
};

export const useBotTurn = ({
                               isBotTurn,
                               answer,
                               correctIndex,
                               nbOptions,
                               successRate = 0.7,
                           }: Params) => {
    useEffect(() => {
        if (!isBotTurn) return;

        const willSucceed = Math.random() < successRate;

        const getRandomIncorrect = () => {
            let i;
            do {
                i = Math.floor(Math.random() * nbOptions);
            } while (i === correctIndex);
            return i;
        };

        const index = willSucceed ? correctIndex : getRandomIncorrect();

        const t = setTimeout(() => answer(index), 1500);
        return () => clearTimeout(t);
    }, [isBotTurn, answer, correctIndex, nbOptions, successRate]);
};