import { useEffect } from 'react';

type Params = {
    isBotTurn: boolean;
    answer: (index: number) => void;
    correctIndex: number;
    nbOptions: number;
    successRate?: number;         // défaut 0.7
    minDelayMs?: number;          // défaut 800 ms
    maxDelayMs?: number;          // défaut 2500 ms
};

export const useBotTurn = ({
                               isBotTurn,
                               answer,
                               correctIndex,
                               nbOptions,
                               successRate = 0.7,
                               minDelayMs = 800,
                               maxDelayMs = 2500,
                           }: Params) => {

    useEffect(() => {
        /* Si ce n’est pas le tour du bot ou données incomplètes → on sort */
        if (!isBotTurn || nbOptions === 0 || correctIndex < 0) return;

        /* On tire un délai aléatoire dans l’intervalle */
        const randomDelay =
            Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;

        const willSucceed = Math.random() < successRate;

        const getRandomIncorrect = () => {
            let i: number;
            do {
                i = Math.floor(Math.random() * nbOptions);
            } while (i === correctIndex);
            return i;
        };

        const choice = willSucceed ? correctIndex : getRandomIncorrect();

        const t = setTimeout(() => answer(choice), randomDelay);
        return () => clearTimeout(t);
    }, [isBotTurn, correctIndex, nbOptions, minDelayMs, maxDelayMs]);
};