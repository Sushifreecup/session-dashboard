import { InstructionGuide } from '@/components/tutorials/InstructionGuide';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppInstructions() {
  return (
    <InstructionGuide
      platform="WhatsApp Web"
      targetUrl="https://web.whatsapp.com"
      domainFilter="whatsapp.com"
      icon={<MessageCircle />}
      accentColor="#22c55e"
      cookiesToLookFor={['wa_lang_pref']}
      localStorageKeys={['WABrowserId', 'WASecretBundle', 'WAToken1', 'WAToken2', 'WAWebData']}
      sessionStorageKeys={['WANoiseInfo']}
      steps={[
        {
          type: 'info',
          title: 'WhatsApp Web usa LocalStorage, NO cookies',
          description: (
            <span>
              A diferencia de Instagram, WhatsApp Web guarda la sesión en el <strong className="text-white">LocalStorage</strong> del navegador. El proceso es diferente: debes inyectar los valores con comandos en la consola (F12).
            </span>
          ),
        },
        {
          type: 'url',
          title: 'Abre WhatsApp Web en modo incógnito',
          description: 'Presiona Ctrl+Shift+N y navega a:',
          url: 'https://web.whatsapp.com',
        },
        {
          type: 'storage',
          title: 'Abre la Consola (F12) y ejecuta los comandos',
          description: (
            <span>
              Ve a <strong className="text-white">Ver Sesión →</strong> de la captura, cambia a la pestaña <strong className="text-white">Local Storage</strong> y copia manualmente cada valor. Luego en la pestaña <strong className="text-white">Console</strong> de F12, pega y ejecuta estos comandos reemplazando los valores:
            </span>
          ),
          code: `localStorage.setItem("WABrowserId", "VALOR_DE_WABrowserId");
localStorage.setItem("WASecretBundle", "VALOR_DE_WASecretBundle");
localStorage.setItem("WAToken1", "VALOR_DE_WAToken1");
localStorage.setItem("WAToken2", "VALOR_DE_WAToken2");
localStorage.setItem("WAWebData", "VALOR_DE_WAWebData");`,
        },
        {
          type: 'refresh',
          title: 'Recarga la página',
          description: 'Presiona F5. WhatsApp Web intentará reconectarse con los tokens almacenados. Si los tokens son válidos, verás los chats cargarse automáticamente.',
        },
        {
          type: 'warning',
          title: 'Limitaciones importantes',
          description: (
            <span>
              WhatsApp Web asocia la sesión con el <strong className="text-white">teléfono del usuario</strong>. Si el usuario cierra sesión desde su celular o desde WhatsApp &gt; Dispositivos Vinculados, la sesión se invalida inmediatamente. Funciona solo mientras el teléfono original tenga activa esa sesión vinculada.
            </span>
          ),
        },
      ]}
    />
  );
}
