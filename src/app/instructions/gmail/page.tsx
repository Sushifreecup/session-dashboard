import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { Mail } from 'lucide-react';

export default function GmailInstructions() {
  return (
    <InstructionGuide
      platform="Gmail"
      targetUrl="https://mail.google.com"
      domainFilter="google.com"
      icon={<Mail />}
      accentColor="#ef4444"
      cookiesToLookFor={['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', '__Secure-1PSID', '__Secure-3PSID', 'LSID', '__Secure-1PAPISID', '__Secure-3PAPISID']}
      steps={[
        {
          type: 'url',
          title: 'Abre Gmail en modo incógnito',
          description: 'Presiona Ctrl+Shift+N y navega a:',
          url: 'https://mail.google.com',
        },
        {
          type: 'cookies',
          title: 'Copia el JSON de cookies de Google',
          description: (
            <span>
              Ve a <strong className="text-white">Capturas</strong> → <strong className="text-white">"Ver Sesión →"</strong>. En el modal, selecciona el dominio <code className="text-red-400">google.com</code> del filtro y haz clic en el botón de dominio para copiar el JSON de cookies de Google.
            </span>
          ),
          data: ['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', '__Secure-1PSID', '__Secure-3PSID'],
        },
        {
          type: 'cookies',
          title: 'Importa en Cookie-Editor',
          description: (
            <span>
              Estando en <code className="text-red-400">mail.google.com</code> o <code className="text-red-400">google.com</code>, abre Cookie-Editor → <strong className="text-white">Import</strong> → pega el JSON → <strong className="text-white">Import</strong>. Las cookies se importan al dominio <code className="text-red-400">.google.com</code>.
            </span>
          ),
        },
        {
          type: 'refresh',
          title: 'Recarga Gmail',
          description: (
            <span>
              Presiona F5 o navega directamente a <code className="text-red-400">mail.google.com</code>. Google debería reconocer la sesión y mostrarte la bandeja de entrada. Las cookies más críticas son <code className="text-yellow-400">SID</code>, <code className="text-yellow-400">SSID</code> y <code className="text-yellow-400">HSID</code>.
            </span>
          ),
        },
        {
          type: 'warning',
          title: 'Google tiene seguridad adicional',
          description: (
            <span>
              Google puede detectar el cambio de sesión y pedir verificación adicional (teléfono, correo de recuperación) si la IP es muy diferente. En algunos casos funciona directamente; en otros, Google puede invalidar la sesión. Para mayor probabilidad de éxito, usa una VPN con la misma IP/país del dispositivo capturado.
            </span>
          ),
        },
      ]}
    />
  );
}
