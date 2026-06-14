import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { HardDrive } from 'lucide-react';

export default function DriveInstructions() {
  return (
    <InstructionGuide
      platform="Google Drive"
      targetUrl="https://drive.google.com"
      cookiesToLookFor={['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', '__Secure-1PSID', '__Secure-3PSID', 'LSID']}
      icon={<HardDrive />}
      accentColor="#3b82f6"
    />
  );
}
