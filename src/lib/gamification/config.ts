export interface NivelConfig {
  nivel: number;
  titulo: string;
  xpNecessario: number;
  cor: string;
}

export const NIVEIS: NivelConfig[] = [
  { nivel: 1, titulo: 'Iniciante', xpNecessario: 0, cor: '#94A3B8' },
  { nivel: 2, titulo: 'Aprendiz', xpNecessario: 100, cor: '#94A3B8' },
  { nivel: 3, titulo: 'Praticante', xpNecessario: 300, cor: '#22C55E' },
  { nivel: 4, titulo: 'Dedicado', xpNecessario: 600, cor: '#22C55E' },
  { nivel: 5, titulo: 'Esforçado', xpNecessario: 1000, cor: '#3B82F6' },
  { nivel: 6, titulo: 'Constante', xpNecessario: 1500, cor: '#3B82F6' },
  { nivel: 7, titulo: 'Disciplinado', xpNecessario: 2500, cor: '#8B5CF6' },
  { nivel: 8, titulo: 'Focado', xpNecessario: 4000, cor: '#8B5CF6' },
  { nivel: 9, titulo: 'Mestre', xpNecessario: 6000, cor: '#F59E0B' },
  { nivel: 10, titulo: 'Lendário', xpNecessario: 10000, cor: '#F59E0B' },
];

export const XP_POR_ACAO = {
  // Hábitos
  HABITO_COMPLETADO: 10,
  DIA_PERFEITO: 50,

  // Agenda
  COMPROMISSO_CRIADO: 5,
  COMPROMISSO_CONCLUIDO: 10,

  // Financeiro
  TRANSACAO_REGISTRADA: 3,
  METAFinanceira_ATINGIDA: 100,

  // Estudos
  ANOTACAO_CRIADA: 15,
  CURSO_CRIADO: 20,

  // Biblioteca
  LIVRO_CONCLUIDO: 25,
  COTACAO_ADICIONADA: 5,

  // Viagem
  VIAGEM_CRIADA: 30,

  // Bônus de streak
  STREAK_7_DIAS: 200,
  STREAK_30_DIAS: 1000,
} as const;

export const XP_LIMITES_DIARIOS: Record<string, number> = {
  HABITO_COMPLETADO: Infinity,
  DIA_PERFEITO: 1,
  COMPROMISSO_CRIADO: 10,
  COMPROMISSO_CONCLUIDO: 10,
  TRANSACAO_REGISTRADA: 20,
  METAFinanceira_ATINGIDA: 1,
  ANOTACAO_CRIADA: 10,
  CURSO_CRIADO: 5,
  LIVRO_CONCLUIDO: 3,
  COTACAO_ADICIONADA: 20,
  VIAGEM_CRIADA: 2,
};

export interface ConquistaDefinicao {
  tipo: string;
  titulo: string;
  descricao: string;
  icone: string;
  categoria: 'habitos' | 'estudos' | 'financeiro' | 'biblioteca' | 'geral';
  xpReward: number;
  progressoMeta: number;
}

export const CONQUISTAS_DEFINICAO: ConquistaDefinicao[] = [
  // === HÁBITOS ===
  {
    tipo: 'primeiro_habito',
    titulo: 'Primeiro Passo',
    descricao: 'Complete seu primeiro hábito',
    icone: '👣',
    categoria: 'habitos',
    xpReward: 50,
    progressoMeta: 1,
  },
  {
    tipo: 'streak_3_dias',
    titulo: 'Fogo Aceso',
    descricao: 'Mantenha sequência de 3 dias',
    icone: '🔥',
    categoria: 'habitos',
    xpReward: 100,
    progressoMeta: 3,
  },
  {
    tipo: 'streak_7_dias',
    titulo: 'Semana Forte',
    descricao: 'Mantenha sequência de 7 dias',
    icone: '💪',
    categoria: 'habitos',
    xpReward: 200,
    progressoMeta: 7,
  },
  {
    tipo: 'streak_30_dias',
    titulo: 'Mês de Ouro',
    descricao: 'Mantenha sequência de 30 dias',
    icone: '👑',
    categoria: 'habitos',
    xpReward: 500,
    progressoMeta: 30,
  },
  {
    tipo: 'streak_60_dias',
    titulo: 'Imparável',
    descricao: 'Mantenha sequência de 60 dias',
    icone: '⚡',
    categoria: 'habitos',
    xpReward: 1000,
    progressoMeta: 60,
  },
  {
    tipo: 'streak_365_dias',
    titulo: 'Lenda Viva',
    descricao: 'Mantenha sequência de 365 dias',
    icone: '🏆',
    categoria: 'habitos',
    xpReward: 5000,
    progressoMeta: 365,
  },
  {
    tipo: 'dia_perfeito',
    titulo: 'Perfeccionista',
    descricao: 'Complete todos os hábitos do dia',
    icone: '✨',
    categoria: 'habitos',
    xpReward: 100,
    progressoMeta: 1,
  },
  {
    tipo: 'semana_perfeita',
    titulo: 'Maratona Perfeita',
    descricao: '7 dias perfeitos seguidos',
    icone: '🌟',
    categoria: 'habitos',
    xpReward: 500,
    progressoMeta: 7,
  },
  {
    tipo: '5_habitos_ativos',
    titulo: 'Coleção de Fogo',
    descricao: 'Tenha 5 hábitos ativos',
    icone: '🎯',
    categoria: 'habitos',
    xpReward: 100,
    progressoMeta: 5,
  },
  {
    tipo: '10_habitos_ativos',
    titulo: 'Multitarefa',
    descricao: 'Tenha 10 hábitos ativos',
    icone: '🎪',
    categoria: 'habitos',
    xpReward: 250,
    progressoMeta: 10,
  },
  {
    tipo: 'madrugador',
    titulo: 'Madrugador',
    descricao: 'Complete um hábito antes das 6h',
    icone: '🌅',
    categoria: 'habitos',
    xpReward: 75,
    progressoMeta: 1,
  },
  {
    tipo: 'noturno',
    titulo: 'Noturno',
    descricao: 'Complete um hábito depois das 22h',
    icone: '🌙',
    categoria: 'habitos',
    xpReward: 75,
    progressoMeta: 1,
  },

  // === ESTUDOS ===
  {
    tipo: 'primeira_nota',
    titulo: 'Primeira Nota',
    descricao: 'Crie sua primeira anotação',
    icone: '📝',
    categoria: 'estudos',
    xpReward: 50,
    progressoMeta: 1,
  },
  {
    tipo: '10_anotacoes',
    titulo: 'Estudioso',
    descricao: 'Crie 10 anotações',
    icone: '📚',
    categoria: 'estudos',
    xpReward: 150,
    progressoMeta: 10,
  },
  {
    tipo: '50_anotacoes',
    titulo: 'Bibliotecário',
    descricao: 'Crie 50 anotações',
    icone: '🏛️',
    categoria: 'estudos',
    xpReward: 400,
    progressoMeta: 50,
  },
  {
    tipo: 'primeiro_curso',
    titulo: 'Primeiro Curso',
    descricao: 'Crie seu primeiro curso',
    icone: '🎓',
    categoria: 'estudos',
    xpReward: 75,
    progressoMeta: 1,
  },
  {
    tipo: '3_cursos',
    titulo: 'Formado',
    descricao: 'Crie 3 cursos',
    icone: '🏅',
    categoria: 'estudos',
    xpReward: 300,
    progressoMeta: 3,
  },
  {
    tipo: '10_cursos',
    titulo: 'Doutor',
    descricao: 'Crie 10 cursos',
    icone: '🎖️',
    categoria: 'estudos',
    xpReward: 800,
    progressoMeta: 10,
  },
  {
    tipo: '10_audio_gravados',
    titulo: 'Voz do Conhecimento',
    descricao: 'Grave 10 áudios',
    icone: '🎙️',
    categoria: 'estudos',
    xpReward: 150,
    progressoMeta: 10,
  },

  // === FINANCEIRO ===
  {
    tipo: 'primeira_transacao',
    titulo: 'Primeiro Registro',
    descricao: 'Registre sua primeira transação',
    icone: '💰',
    categoria: 'financeiro',
    xpReward: 50,
    progressoMeta: 1,
  },
  {
    tipo: '50_transacoes',
    titulo: 'Contador',
    descricao: 'Registre 50 transações',
    icone: '📊',
    categoria: 'financeiro',
    xpReward: 150,
    progressoMeta: 50,
  },
  {
    tipo: '100_transacoes',
    titulo: 'Organizador',
    descricao: 'Registre 100 transações',
    icone: '📋',
    categoria: 'financeiro',
    xpReward: 300,
    progressoMeta: 100,
  },
  {
    tipo: 'primeira_meta',
    titulo: 'Guardião',
    descricao: 'Atinga sua primeira meta financeira',
    icone: '🛡️',
    categoria: 'financeiro',
    xpReward: 200,
    progressoMeta: 1,
  },
  {
    tipo: '5_metas',
    titulo: 'Investidor',
    descricao: 'Atinga 5 metas financeiras',
    icone: '💎',
    categoria: 'financeiro',
    xpReward: 500,
    progressoMeta: 5,
  },

  // === BIBLIOTECA ===
  {
    tipo: 'primeiro_livro',
    titulo: 'Leitor Iniciante',
    descricao: 'Conclua 1 livro',
    icone: '📖',
    categoria: 'biblioteca',
    xpReward: 75,
    progressoMeta: 1,
  },
  {
    tipo: '5_livros',
    titulo: 'Leitor Ávido',
    descricao: 'Conclua 5 livros',
    icone: '📚',
    categoria: 'biblioteca',
    xpReward: 200,
    progressoMeta: 5,
  },
  {
    tipo: '10_livros',
    titulo: 'Bibliófilo',
    descricao: 'Conclua 10 livros',
    icone: '🏰',
    categoria: 'biblioteca',
    xpReward: 500,
    progressoMeta: 10,
  },
  {
    tipo: '20_citacoes',
    titulo: 'Colecionador',
    descricao: 'Salve 20 citações',
    icone: '💬',
    categoria: 'biblioteca',
    xpReward: 150,
    progressoMeta: 20,
  },
  {
    tipo: '10_avaliacoes',
    titulo: 'Crítico',
    descricao: 'Faça 10 avaliações',
    icone: '⭐',
    categoria: 'biblioteca',
    xpReward: 100,
    progressoMeta: 10,
  },

  // === GERAIS ===
  {
    tipo: 'perfil_completo',
    titulo: 'Bem-vindo',
    descricao: 'Complete seu perfil',
    icone: '👋',
    categoria: 'geral',
    xpReward: 50,
    progressoMeta: 1,
  },
  {
    tipo: '7_dias_app',
    titulo: 'Consistente',
    descricao: 'Use o app 7 dias seguidos',
    icone: '📱',
    categoria: 'geral',
    xpReward: 150,
    progressoMeta: 7,
  },
  {
    tipo: '30_dias_app',
    titulo: 'Veterano',
    descricao: 'Use o app 30 dias seguidos',
    icone: '🏅',
    categoria: 'geral',
    xpReward: 400,
    progressoMeta: 30,
  },
  {
    tipo: 'explorador',
    titulo: 'Explorador',
    descricao: 'Use todos os módulos do app',
    icone: '🧭',
    categoria: 'geral',
    xpReward: 200,
    progressoMeta: 1,
  },
  {
    tipo: 'nivel_5',
    titulo: 'Nível 5',
    descricao: 'Alcance o nível 5',
    icone: '⭐',
    categoria: 'geral',
    xpReward: 300,
    progressoMeta: 1,
  },
  {
    tipo: 'nivel_10',
    titulo: 'Nível 10',
    descricao: 'Alcance o nível 10',
    icone: '🌟',
    categoria: 'geral',
    xpReward: 1000,
    progressoMeta: 1,
  },
  {
    tipo: 'early_bird',
    titulo: 'Early Bird',
    descricao: 'Faça login antes das 7h',
    icone: '🐦',
    categoria: 'geral',
    xpReward: 50,
    progressoMeta: 1,
  },
  {
    tipo: 'coruja',
    titulo: 'Coruja',
    descricao: 'Faça login depois da meia-noite',
    icone: '🦉',
    categoria: 'geral',
    xpReward: 50,
    progressoMeta: 1,
  },
];

export function getNivelByXP(xpTotal: number): { nivel: number; xpAtualNivel: number; xpProximoNivel: number; titulo: string } {
  let nivelAtual = NIVEIS[0];

  for (let i = NIVEIS.length - 1; i >= 0; i--) {
    if (xpTotal >= NIVEIS[i].xpNecessario) {
      nivelAtual = NIVEIS[i];
      break;
    }
  }

  const proximoNivel = NIVEIS.find(n => n.nivel === nivelAtual.nivel + 1);
  const xpAtualNivel = xpTotal - nivelAtual.xpNecessario;
  const xpProximoNivel = proximoNivel ? proximoNivel.xpNecessario - nivelAtual.xpNecessario : 0;

  return {
    nivel: nivelAtual.nivel,
    xpAtualNivel,
    xpProximoNivel,
    titulo: nivelAtual.titulo,
  };
}

export function getCorNivel(nivel: number): string {
  const nivelConfig = NIVEIS.find(n => n.nivel === nivel);
  return nivelConfig?.cor || '#94A3B8';
}
