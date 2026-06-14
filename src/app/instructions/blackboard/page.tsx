import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { GraduationCap } from 'lucide-react';

export default function BlackboardInstructions() {
  return (
    <InstructionGuide
      platform="Blackboard (UP)"
      targetUrl="https://aulavirtual.up.edu.pe"
      domainFilter="up.edu.pe"
      icon={<GraduationCap />}
      accentColor="#a855f7"
      cookiesToLookFor={['s_session_id', 'BBLEARN_sess_id', 'BbRouter', 'web_client_cache_guid']}
      steps={[
        {
          type: 'url',
          title: 'Abre el Aula Virtual en modo incógnito',
          description: 'Presiona Ctrl+Shift+N y navega a la URL de Blackboard de la UP:',
          url: 'https://aulavirtual.up.edu.pe',
        },
        {
          type: 'cookies',
          title: 'Copia el JSON de cookies de up.edu.pe',
          description: (
            <span>
              En <strong className="text-white">Capturas</strong>, abre la sesión → <strong className="text-white">"Ver Sesión →"</strong>. Filtra por el dominio <code className="text-purple-400">up.edu.pe</code> usando el selector de dominios o el botón de acceso rápido en la barra superior del modal. Copia el JSON con el botón.
            </span>
          ),
          data: ['s_session_id', 'BBLEARN_sess_id', 'BbRouter', 'web_client_cache_guid'],
        },
        {
          type: 'cookies',
          title: 'Importa en Cookie-Editor',
          description: (
            <span>
              Con Cookie-Editor instalada y estando en <code className="text-purple-400">aulavirtual.up.edu.pe</code> (puede ser en la pantalla de login), haz clic en la extensión → <strong className="text-white">Import</strong> → pega el JSON → clic en <strong className="text-white">Import</strong>.
            </span>
          ),
        },
        {
          type: 'refresh',
          title: 'Recarga la página',
          description: (
            <span>
              Presiona F5. Blackboard debería reconocer la sesión y redirigirte al panel del estudiante directamente. Si sigue en la pantalla de login, intenta navegar manualmente a <code className="text-purple-400">aulavirtual.up.edu.pe/ultra/course</code> después de importar.
            </span>
          ),
        },
        {
          type: 'warning',
          title: 'Si redirige al inicio de sesión de Microsoft',
          description: (
            <span>
              Si el Aula Virtual usa Single Sign-On (SSO) de Microsoft, es posible que también necesites importar las cookies de <code className="text-purple-400">login.microsoftonline.com</code> si están disponibles en la captura. Blackboard verifica estrictamente la sesión.
            </span>
          ),
        },
      ]}
    />
  );
}
