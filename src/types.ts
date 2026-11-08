/**
 * Tipos compartilhados. Seguem os contratos definidos no README da Refresca,
 * que são iguais em todos os repositórios da equipe.
 */

export type NivelCalor = 'normal' | 'atencao' | 'perigo';

export interface Leitura {
  indiceCalor: number;
  nivel: NivelCalor;
  medidoEm: string;
}

export interface PontoRefresca {
  id: number;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  temAgua: boolean;
  temSombra: boolean;
  temBanheiro: boolean;
  horario: string;
  ultimaLeitura: Leitura | null;
}

export interface AlertaHoje {
  data: string;
  perigoso: boolean;
  probabilidade: number;
  mensagem: string;
}

export interface Pausa {
  id: number;
  registradaEm: string;
  duracaoMin: number;
  bebeuAgua: boolean;
  sincronizada: boolean;
}

export interface Perfil {
  apelido: string;
  tipoTrabalho: string;
  contatoNome: string;
  contatoTelefone: string;
}

/** De onde vieram os dados mostrados na tela. */
export type FonteDados = 'api' | 'cache' | 'demo';

export interface Resultado<T> {
  dados: T;
  fonte: FonteDados;
}
