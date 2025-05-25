import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

interface AvatarSelectorProps {
    selectedAvatar: string;
    onSelect: (avatarUrl: string) => void;
}

const generateRandomSeeds = (count: number): string[] => {
    const adjectives = ['Happy', 'Cool', 'Fast', 'Witty', 'Funky', 'Sweet', 'Choco', 'Ninja', 'Lucky', 'Cosmic'];
    const nouns = ['Fox', 'Panda', 'Alien', 'Burger', 'Cat', 'Robot', 'Duck', 'Zombie', 'Wizard', 'Pirate'];

    const seeds: Set<string> = new Set();

    while (seeds.size < count) {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 100);
        seeds.add(`${adjective}${noun}${number}`);
    }

    return Array.from(seeds);
};

const generateAvatarUrl = (seed: string) =>
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}`;

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onSelect }) => {
    const [seeds, setSeeds] = useState<string[]>([]);

    const refreshSeeds = () => {
        setSeeds(generateRandomSeeds(12)); // 12 avatars comme avant
    };

    useEffect(() => {
        refreshSeeds(); // Initial load
    }, []);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
                {seeds.map((seed) => {
                    const url = generateAvatarUrl(seed);
                    const isSelected = selectedAvatar === url;

                    return (
                        <button
                            key={seed}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                onSelect(url);
                            }}
                            className={clsx(
                                'border-2 rounded-full p-1 transition hover:border-primary focus:outline-none',
                                isSelected ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                            )}
                        >
                            <img
                                src={url}
                                alt={seed}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        </button>
                    );
                })}
            </div>

            <div className="text-center">
                <button
                    type="button"
                    onClick={refreshSeeds}
                    className="text-sm text-primary font-medium hover:underline"
                >
                    🔄 Rafraîchir les avatars
                </button>
            </div>
        </div>
    );
};

export default AvatarSelector;