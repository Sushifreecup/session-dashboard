import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { Music2 } from 'lucide-react';

export default function TikTokInstructions() {
  return (
    <InstructionGuide 
      platform="TikTok"
      targetUrl="https://www.tiktok.com"
      cookiesToLookFor={['sessionid', 'store-idc', 'store-country-code', 'odin_tt', 'msToken']}
      icon={<Music2 />}
      colorClass="bg-cyan-500 text-cyan-400"
    />
  );
}
