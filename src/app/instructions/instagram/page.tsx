import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { Instagram } from 'lucide-react';

export default function InstagramInstructions() {
  return (
    <InstructionGuide
      platform="Instagram"
      targetUrl="https://www.instagram.com"
      cookiesToLookFor={['sessionid', 'csrftoken', 'ds_user_id', 'rur', 'mid']}
      icon={<Instagram />}
      accentColor="#ec4899"
    />
  );
}
