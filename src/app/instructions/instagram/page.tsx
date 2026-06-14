import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { Instagram } from 'lucide-react';

export default function InstagramInstructions() {
  return (
    <InstructionGuide
      platform="Instagram"
      targetUrl="https://www.instagram.com"
      domainFilter="instagram.com"
      icon={<Instagram />}
      accentColor="#ec4899"
      cookiesToLookFor={['sessionid', 'csrftoken', 'ds_user_id', 'datr', 'ig_did', 'mid']}
      steps={[
        {
          type: 'url',
          title: 'Abre Instagram en modo incógnito',
          description: 'Presiona Ctrl+Shift+N para abrir una ventana de incógnito y navega a:',
          url: 'https://www.instagram.com',
        },
        {
          type: 'cookies',
          title: 'Copia el JSON de cookies desde el modal',
          description: (
            <span>
              En la página de <strong className="text-white">Capturas</strong>, abre el dispositivo deseado → clic en <strong className="text-white">"Ver Sesión →"</strong>. Luego en la barra azul/morada, haz clic en <strong className="text-white">"Solo instagram.com"</strong>. El JSON se copia automáticamente al portapapeles.
            </span>
          ),
          data: ['sessionid', 'csrftoken', 'ds_user_id', 'datr', 'ig_did', 'mid'],
        },
        {
          type: 'info',
          title: 'Instala Cookie-Editor si no la tienes',
          description: (
            <span>
              Busca <strong className="text-white">"Cookie-Editor"</strong> en la Chrome Web Store e instálala. Es gratuita y soporta importar JSON directamente.
            </span>
          ),
          url: 'https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm',
        },
        {
          type: 'cookies',
          title: 'Importa el JSON en Cookie-Editor',
          description: (
            <span>
              Estando en <code className="text-pink-400">instagram.com</code>, haz clic en el ícono de Cookie-Editor (extensión) → botón <strong className="text-white">Import</strong> (ícono de flecha abajo) → pega el JSON → clic en <strong className="text-white">Import</strong>.
            </span>
          ),
        },
        {
          type: 'refresh',
          title: 'Recarga la página',
          description: 'Presiona F5 o Ctrl+R. Si las cookies son válidas y no han expirado, entrarás directamente a la cuenta de Instagram sin pedir contraseña.',
        },
        {
          type: 'warning',
          title: 'Si no funciona o pide verificación',
          description: 'Instagram puede pedir verificación si detecta un User-Agent diferente. Intenta replicar el User-Agent del dispositivo original usando la extensión "User-Agent Switcher". El User-Agent está visible en la tarjeta de la sesión capturada.',
        },
      ]}
    />
  );
}
