import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { HardDrive } from 'lucide-react';

export default function DriveInstructions() {
  return (
    <InstructionGuide 
      platform="Google Drive"
      targetUrl="https://drive.google.com"
      cookiesToLookFor={['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', '__Secure-1PSID', '__Secure-3PSID']}
      icon={<HardDrive />}
      colorClass="bg-blue-500 text-blue-400"
    />
  );
}
