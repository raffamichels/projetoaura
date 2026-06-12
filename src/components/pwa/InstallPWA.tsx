'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, DeviceMobile, X } from '@phosphor-icons/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verifica se já está em modo standalone (já instalado)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Detecta iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Verifica se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) return;

    // Verifica se o usuário já dispensou o popup recentemente (24h)
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < twentyFourHours) {
        return;
      }
    }

    // Verifica se o usuário já instalou
    const installed = localStorage.getItem('pwa-installed');
    if (installed) return;

    // Para iOS, mostra o dialog após um delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Para Android/Chrome, escuta o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Mostra o dialog após um delay
      setTimeout(() => {
        setShowDialog(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Escuta quando o app é instalado
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setShowDialog(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
      }
      setDeferredPrompt(null);
      setShowDialog(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowDialog(false);
  };

  // Não mostra nada se já está em modo standalone
  if (isStandalone) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="bg-surface border-line text-ink max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center">
              <DeviceMobile className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl text-ink">
            Adicionar Aura na Tela Inicial
          </DialogTitle>
          <DialogDescription className="text-center text-ink-soft">
            Instale o app na sua tela inicial para acesso rápido e uma experiência sem barra de navegação.
          </DialogDescription>
        </DialogHeader>

        {isIOS ? (
          <div className="space-y-3 py-4">
            <p className="text-sm text-ink-soft text-center">
              Para instalar no seu iPhone/iPad:
            </p>
            <ol className="text-sm text-ink-soft space-y-2 list-decimal list-inside">
              <li>Toque no botão <span className="text-ink font-medium">Compartilhar</span> na barra inferior</li>
              <li>Role para baixo e toque em <span className="text-ink font-medium">&quot;Adicionar à Tela de Início&quot;</span></li>
              <li>Confirme tocando em <span className="text-ink font-medium">Adicionar</span></li>
            </ol>
          </div>
        ) : (
          <div className="py-2">
            <ul className="text-sm text-ink-soft space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                Acesso rápido direto da tela inicial
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                Experiência em tela cheia, sem barra de URL
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                Funciona como um aplicativo nativo
              </li>
            </ul>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {!isIOS && (
            <Button
              onClick={handleInstall}
              className="w-full bg-brand hover:bg-brand-dark text-white duration-150"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar Agora
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full text-ink-soft hover:text-ink hover:bg-surface-hover duration-150"
          >
            <X className="w-4 h-4 mr-2" />
            {isIOS ? 'Fechar' : 'Agora Não'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
