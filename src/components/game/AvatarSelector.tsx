
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AvatarSelectorProps {
  onSelect: (avatar: string) => void;
  selectedAvatar: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ onSelect, selectedAvatar }) => {
  // Mock avatar options - in a real app, you'd use actual avatars
  const avatarOptions = [
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
  ];
  
  return (
    <div className="grid grid-cols-4 gap-3">
      {avatarOptions.map((avatar, index) => (
        <div 
          key={index}
          onClick={() => onSelect(avatar)}
          className={`cursor-pointer transition-all duration-200 ${
            selectedAvatar === avatar 
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
