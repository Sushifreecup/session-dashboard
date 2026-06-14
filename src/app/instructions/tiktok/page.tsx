import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { Music2 } from 'lucide-react';

export default function TikTokInstructions() {
  return (
    <InstructionGuide
      platform="TikTok"
      targetUrl="https://www.tiktok.com"
      domainFilter="tiktok.com"
      icon={<Music2 />}
      accentColor="#06b6d4"
      cookiesToLookFor={['sessionid', 'sessionid_ss', 'odin_tt', 'tt_csrf_token', 'msToken', 'ttwid']}
      steps={[
        {
          type: 'url',
          title: 'Abre TikTok en modo incógnito',
          description: 'Presiona Ctrl+Shift+N y navega a:',
          url: 'https://www.tiktok.com',
        },
        {
          type: 'cookies',
          title: 'Copia el JSON de cookies de TikTok',
          description: (
            <span>
              Ve a <strong className="text-white">Capturas</strong> → <strong className="text-white">"Ver Sesión →"</strong>. En la barra del modal, haz clic en el botón <strong className="text-white">"Solo tiktok.com"</strong> para copiar solo las cookies de TikTok en formato JSON.
            </span>
          ),
          data: ['sessionid', 'sessionid_ss', 'odin_tt', 'tt_csrf_token', 'msToken', 'ttwid'],
        },
        {
          type: 'cookies',
          title: 'Importa en Cookie-Editor',
          description: (
            <span>
              Estando en <code className="text-cyan-400">tiktok.com</code>, abre Cookie-Editor → <strong className="text-white">Import</strong> → pega el JSON → <strong className="text-white">Import</strong>.
            </span>
          ),
        },
        {
          type: 'refresh',
          title: 'Recarga y verifica',
          description: (
            <span>
              Presiona F5. TikTok debería mostrarte la cuenta del usuario en la esquina superior derecha sin pedir login. La cookie más importante es <code className="text-cyan-400">sessionid</code> — sin ella no funciona.
            </span>
          ),
        },
        {
          type: 'warning',
          title: 'Si aparece captcha o bloqueo',
          description: 'TikTok usa detección de comportamiento. Si aparece un captcha o bloqueo, espera unos minutos e intenta de nuevo. También puede ayudar cambiar el User-Agent al del dispositivo original con la extensión "User-Agent Switcher".',
        },
      ]}
    />
  );
}
