export interface Compromisso {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  horaInicio: string;
  horaFim: string | null;
  categoria: string | null;
  cor: string;
  concluido: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}