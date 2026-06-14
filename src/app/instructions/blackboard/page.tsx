import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { GraduationCap } from 'lucide-react';

export default function BlackboardInstructions() {
  return (
    <InstructionGuide
      platform="Blackboard"
      targetUrl="https://up.blackboard.com"
      cookiesToLookFor={['s_session_id', 'session_id', 'BBLEARN_sess_id', 'web_client_cache_guid']}
      icon={<GraduationCap />}
      accentColor="#a855f7"
    />
  );
}
