import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppInstructions() {
  return (
    <InstructionGuide 
      platform="WhatsApp Web"
      targetUrl="https://web.whatsapp.com"
      cookiesToLookFor={[]}
      localStorageKeys={['WABrowserId', 'WASecretBundle', 'WAToken1', 'WAToken2', 'WAWebData']}
      sessionStorageKeys={['WANoiseInfo']}
      icon={<MessageCircle />}
      colorClass="bg-green-500 text-green-400"
    />
  );
}
