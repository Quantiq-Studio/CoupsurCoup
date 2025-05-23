
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { avatarImages } from '@/data/avatars';

interface AvatarSelectorProps {
  onSelect: (avatar: string) => void;
  selectedAvatar?: string;
  selected?: string; // Added for backwards compatibility
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ onSelect, selectedAvatar, selected }) => {
  // Use selectedAvatar if provided, otherwise fall back to selected prop
  const activeAvatar = selectedAvatar || selected || avatarImages[0];
  
  return (
    <div className="grid grid-cols-4 gap-3">
      {avatarImages.map((avatar, index) => (
        <div 
          key={index}
          onClick={() => onSelect(avatar)}
          className={`cursor-pointer transition-all duration-200 ${
            activeAvatar === avatar 
              ? 'scale-110 ring-2 ring-primary ring-offset-2' 
              : 'hover:scale-105'
          }`}
        >
          <Avatar className="w-full h-auto aspect-square">
            <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
            <AvatarFallback>{index + 1}</AvatarFallback>
          </Avatar>
        </div>
      ))}
    </div>
  );
};

export default AvatarSelector;
