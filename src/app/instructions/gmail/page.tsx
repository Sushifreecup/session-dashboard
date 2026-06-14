import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { Mail } from 'lucide-react';

export default function GmailInstructions() {
  return (
    <InstructionGuide 
      platform="Gmail"
      targetUrl="https://mail.google.com"
      cookiesToLookFor={['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', '__Secure-1PSID', '__Secure-3PSID']}
      icon={<Mail />}
      colorClass="bg-red-500 text-red-400"
    />
  );
}
