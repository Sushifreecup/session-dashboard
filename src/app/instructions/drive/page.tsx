import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { HardDrive } from 'lucide-react';

export default function DriveInstructions() {
  return (
    <InstructionGuide
      platform="Google Drive"
      targetUrl="https://drive.google.com"
      domainFilter="google.com"
      icon={<HardDrive />}
      accentColor="#3b82f6"
      cookiesToLookFor={['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', '__Secure-1PSID', '__Secure-3PSID', 'LSID']}
      steps={[
        {
          type: 'info',
          title: 'Drive usa las mismas cookies que Gmail',
          description: 'Google Drive y Gmail comparten la misma sesión de Google. Si ya entraste a Gmail, Drive también funcionará automáticamente. Si no, sigue estos pasos:',
        },
        {
          type: 'url',
          title: 'Abre Google Drive en modo incógnito',
          description: 'Presiona Ctrl+Shift+N y navega a:',
          url: 'https://drive.google.com',
        },
        {
          type: 'cookies',
          title: 'Importa las cookies de Google',
          description: (
            <span>
              Las cookies son las mismas que para Gmail. En <strong className="text-white">Capturas</strong> → <strong className="text-white">"Ver Sesión →"</strong>, filtra por <code className="text-blue-400">google.com</code> y copia el JSON. Importa en Cookie-Editor estando en <code className="text-blue-400">drive.google.com</code>.
            </span>
          ),
          data: ['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', '__Secure-1PSID', '__Secure-3PSID'],
        },
        {
          type: 'refresh',
          title: 'Recarga para acceder a los archivos',
          description: (
            <span>
              Presiona F5. Google Drive debería mostrar directamente los archivos y carpetas de la cuenta. También funcionará Google Docs, Sheets, y demás servicios de Google del mismo usuario.
            </span>
          ),
        },
        {
          type: 'warning',
          title: 'Descarga de archivos',
          description: (
            <span>
              Puedes descargar archivos directamente desde Drive. Para archivos de Classroom o archivos restringidos por la institución, puede que necesites también las cookies de <code className="text-blue-400">accounts.google.com</code> y <code className="text-blue-400">classroom.google.com</code> si las tiene la captura.
            </span>
          ),
        },
      ]}
    />
  );
}
