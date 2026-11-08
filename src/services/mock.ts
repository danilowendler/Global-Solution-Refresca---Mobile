import { nivelPorIndice } from '@/services/calor';
import type { AlertaHoje, PontoRefresca } from '@/types';

/**
 * Dados de demonstração, SIMULADOS pela equipe.
 *
 * Usados quando a API principal não está configurada ou não responde,
 * para que o app possa ser apresentado mesmo sem o backend no ar.
 * Os estabelecimentos são fictícios; os endereços são ruas reais da
 * Vila Mariana, com coordenadas aproximadas.
 */

function leituraSimulada(indiceCalor: number, minutosAtras: number) {
  const medidoEm = new Date(Date.now() - minutosAtras * 60_000).toISOString();
  return { indiceCalor, nivel: nivelPorIndice(indiceCalor), medidoEm };
}

export function pontosDemo(): PontoRefresca[] {
  return [
    {
      id: 1,
      nome: 'Padaria parceira (exemplo)',
      endereco: 'Rua Domingos de Morais, perto do metrô Vila Mariana',
      latitude: -23.5893,
      longitude: -46.6347,
      temAgua: true,
      temSombra: true,
      temBanheiro: true,
      horario: '6h às 21h',
      ultimaLeitura: leituraSimulada(34.2, 4),
    },
    {
      id: 2,
      nome: 'Banca parceira (exemplo)',
      endereco: 'Rua Domingos de Morais, perto do metrô Santa Cruz',
      latitude: -23.5990,
      longitude: -46.6366,
      temAgua: true,
      temSombra: true,
      temBanheiro: false,
      horario: '7h às 19h',
      ultimaLeitura: leituraSimulada(31.0, 7),
    },
    {
      id: 3,
      nome: 'Farmácia parceira (exemplo)',
      endereco: 'Rua Vergueiro, perto do metrô Ana Rosa',
      latitude: -23.5813,
      longitude: -46.6383,
      temAgua: true,
      temSombra: false,
      temBanheiro: true,
      horario: '24 horas',
      ultimaLeitura: leituraSimulada(29.4, 2),
    },
    {
      id: 4,
      nome: 'Lanchonete parceira (exemplo)',
      endereco: 'Rua Sena Madureira',
      latitude: -23.5918,
      longitude: -46.6311,
      temAgua: true,
      temSombra: true,
      temBanheiro: true,
      horario: '8h às 22h',
      ultimaLeitura: leituraSimulada(33.1, 12),
    },
    {
      id: 5,
      nome: 'Mercadinho parceiro (exemplo)',
      endereco: 'Rua Joaquim Távora',
      latitude: -23.5952,
      longitude: -46.6398,
      temAgua: true,
      temSombra: false,
      temBanheiro: false,
      horario: '7h às 20h',
      ultimaLeitura: null,
    },
  ];
}

export function alertaDemo(): AlertaHoje {
  return {
    data: new Date().toISOString().slice(0, 10),
    perigoso: true,
    probabilidade: 0.82,
    mensagem: 'Hoje o calor deve ficar perigoso à tarde. Leve água e programe pausas na sombra.',
  };
}
