import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { GraduationCap } from 'lucide-react';

export default function BlackboardInstructions() {
  return (
    <InstructionGuide 
      platform="Blackboard"
      targetUrl="https://up.blackboard.com"
      cookiesToLookFor={['s_session_id', 'session_id']}
      icon={<GraduationCap />}
      colorClass="bg-purple-500 text-purple-400"
    />
  );
}
