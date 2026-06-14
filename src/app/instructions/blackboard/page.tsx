import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { GraduationCap } from 'lucide-react';

export default function BlackboardInstructions() {
  return (
    <InstructionGuide
      platform="Blackboard (UP)"
      targetUrl="https://up.blackboard.com"
      domainFilter="blackboard.com"
      icon={<GraduationCap />}
      accentColor="#a855f7"
      cookiesToLookFor={['s_session_id', 'BBLEARN_sess_id', 'BbRouter', 'web_client_cache_guid']}
      steps={[
        {
          type: 'url',
          title: 'Abre Blackboard en modo incógnito',
          description: 'Presiona Ctrl+Shift+N y navega a la URL de Blackboard de la UP:',
          url: 'https://up.blackboard.com',
        },
        {
          type: 'cookies',
          title: 'Copia el JSON de cookies de Blackboard',
          description: (
            <span>
              En <strong className="text-white">Capturas</strong>, abre la sesión → <strong className="text-white">"Ver Sesión →"</strong>. Filtra por <code className="text-purple-400">blackboard.com</code> usando el selector de dominios o el botón de dominio en la barra superior del modal. Copia el JSON con el botón.
            </span>
          ),
          data: ['s_session_id', 'BBLEARN_sess_id', 'BbRouter', 'web_client_cache_guid'],
        },
        {
          type: 'cookies',
          title: 'Importa en Cookie-Editor',
          description: (
            <span>
              Con Cookie-Editor instalada y estando en <code className="text-purple-400">up.blackboard.com</code>, haz clic en la extensión → <strong className="text-white">Import</strong> → pega el JSON → clic en <strong className="text-white">Import</strong>.
            </span>
          ),
        },
        {
          type: 'refresh',
          title: 'Recarga la página',
          description: (
            <span>
              Presiona F5. Blackboard debería reconocer la sesión y redirigirte al panel del estudiante directamente. Si pide login, intenta navegar directamente a <code className="text-purple-400">up.blackboard.com/ultra/course</code> después de importar.
            </span>
          ),
        },
        {
          type: 'warning',
          title: 'Si no funciona o redirige al login',
          description: (
            <span>
              Blackboard verifica la IP y el User-Agent en algunos casos. Asegúrate de importar las cookies <strong className="text-white">antes</strong> de que la página cargue el login. Si aún falla, intenta también con las cookies del dominio <code className="text-purple-400">up.edu.pe</code> que puedas tener en la captura.
            </span>
          ),
        },
      ]}
    />
  );
}
