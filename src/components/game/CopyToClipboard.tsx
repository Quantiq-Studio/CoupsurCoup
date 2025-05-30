
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, CopyIcon } from 'lucide-react';

interface CopyToClipboardProps {
  text: string;
  message?: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text, message = "Le code a été copié dans le presse-papiers." }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copié !",
        description: message,
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-white hover:bg-white/20 hover:text-white"
      onClick={handleCopy}
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
    </Button>
  );
};

export default CopyToClipboard;
