
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, CopyIcon } from 'lucide-react';

interface CopyToClipboardProps {
  text: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copié !",
        description: "Le code a été copié dans le presse-papiers.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-white hover:bg-white/20"
      onClick={handleCopy}
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
    </Button>
  );
};

export default CopyToClipboard;
