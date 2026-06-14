import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { Music2 } from 'lucide-react';

export default function TikTokInstructions() {
  return (
    <InstructionGuide
      platform="TikTok"
      targetUrl="https://www.tiktok.com"
      cookiesToLookFor={['sessionid', 'sessionid_ss', 'store-idc', 'odin_tt', 'msToken', 'tt_csrf_token']}
      icon={<Music2 />}
      accentColor="#06b6d4"
    />
  );
}
