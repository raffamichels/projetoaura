/**
 * Hook customizado para verificar o plano do usuário e acesso a recursos premium
 */

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { PlanoUsuario, RecursoPremium } from '@/types/planos';
import { verificarAcessoRecurso, isPremium, isFree, getPlanoEfetivo } from '@/lib/planos-helper';

export function usePlano() {
  const { data: session, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  const plano = (session?.user?.plano as PlanoUsuario) || PlanoUsuario.FREE;
  const planoExpiraEm = session?.user?.planoExpiraEm;
  const planoEfetivo = getPlanoEfetivo(plano, planoExpiraEm);

  /**
   * Verifica se o usuário tem acesso a um recurso específico
   */
  const temAcessoARecurso = (recurso: RecursoPremium): boolean => {
    const resultado = verificarAcessoRecurso(plano, planoExpiraEm, recurso);
    return resultado.temAcesso;
  };

  /**
   * Verifica se o usuário é Premium
   */
  const ehPremium = isPremium(planoEfetivo);

  /**
   * Verifica se o usuário é Free
   */
  const ehFree = isFree(planoEfetivo);

  /**
   * Força refresh da sessão para obter dados atualizados
   */
  const refreshSessao = async () => {
    setIsUpdating(true);
    try {
      await update();
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    plano: planoEfetivo,
    planoOriginal: plano,
    planoExpiraEm,
    ehPremium,
    ehFree,
    temAcessoARecurso,
    refreshSessao,
    isUpdating,
    // Verificações específicas de recursos
    podeGerarResenhaIA: temAcessoARecurso(RecursoPremium.GERAR_RESENHA_IA),
    podeSincronizarGoogleCalendar: temAcessoARecurso(RecursoPremium.SINCRONIZAR_GOOGLE_CALENDAR),
  };
}
