import React from 'react';
import clsx from 'clsx';
import { avatarSeeds, getAvatarUrl } from '@/data/avatars';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarUrl: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onSelect }) => {
  return (
      <div className="grid grid-cols-4 gap-4">
        {avatarSeeds.map((seed) => {
          const url = getAvatarUrl(seed);
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
  );
};

export default AvatarSelector;