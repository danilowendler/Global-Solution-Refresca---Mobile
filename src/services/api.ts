import type { SQLiteDatabase } from 'expo-sqlite';

import {
  lerPontosDoCache,
  listarPausasPendentes,
  marcarPausaSincronizada,
  salvarPontosNoCache,
} from '@/db/database';
import { alertaDemo, pontosDemo } from '@/services/mock';
import type { AlertaHoje, Pausa, PontoRefresca, Resultado } from '@/types';

/**
 * Cliente da API principal da Refresca (C# / .NET).
 *
 * A URL vem de EXPO_PUBLIC_API_URL (arquivo .env). Sem ela, ou se a API não
 * responder, o app usa o cache local e, por último, os dados de demonstração.
 * Assim o app nunca fica com a tela vazia na rua, onde a internet falha.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
const TRABALHADOR_ID = Number(process.env.EXPO_PUBLIC_TRABALHADOR_ID ?? '1');
const TEMPO_LIMITE_MS = 6000;

export const apiConfigurada = API_URL.length > 0;

async function requisicao<T>(caminho: string, init?: RequestInit): Promise<T> {
  if (!apiConfigurada) {
    throw new Error('API não configurada');
  }
  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(`${API_URL}${caminho}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      signal: controle.signal,
    });
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status} em ${caminho}`);
    }
    if (resposta.status === 204) {
      return undefined as T;
    }
    return (await resposta.json()) as T;
  } finally {
    clearTimeout(temporizador);
  }
}

/** GET /api/alertas/hoje */
export async function buscarAlertaHoje(): Promise<Resultado<AlertaHoje>> {
  try {
    const dados = await requisicao<AlertaHoje>('/api/alertas/hoje');
    return { dados, fonte: 'api' };
  } catch {
    return { dados: alertaDemo(), fonte: 'demo' };
  }
}

/** GET /api/pontos, com cache no SQLite. */
export async function buscarPontos(db: SQLiteDatabase): Promise<Resultado<PontoRefresca[]>> {
  try {
    const dados = await requisicao<PontoRefresca[]>('/api/pontos');
    await salvarPontosNoCache(db, dados);
    return { dados, fonte: 'api' };
  } catch {
    const cache = await lerPontosDoCache(db);
    if (cache.length > 0) {
      return { dados: cache, fonte: 'cache' };
    }
    return { dados: pontosDemo(), fonte: 'demo' };
  }
}

/** GET /api/pontos/{id}, com cache e demonstração como reserva. */
export async function buscarPonto(
  db: SQLiteDatabase,
  id: number,
): Promise<Resultado<PontoRefresca | null>> {
  try {
    const dados = await requisicao<PontoRefresca>(`/api/pontos/${id}`);
    return { dados, fonte: 'api' };
  } catch {
    const cache = await lerPontosDoCache(db);
    const doCache = cache.find((ponto) => ponto.id === id);
    if (doCache) {
      return { dados: doCache, fonte: 'cache' };
    }
    return { dados: pontosDemo().find((ponto) => ponto.id === id) ?? null, fonte: 'demo' };
  }
}

/** POST /api/pausas */
async function enviarPausa(pausa: Pausa): Promise<void> {
  await requisicao<unknown>('/api/pausas', {
    method: 'POST',
    body: JSON.stringify({
      trabalhadorId: TRABALHADOR_ID,
      registradaEm: pausa.registradaEm,
      duracaoMin: pausa.duracaoMin,
      bebeuAgua: pausa.bebeuAgua,
    }),
  });
}

/**
 * Envia para a API as pausas que ainda não foram sincronizadas.
 * Devolve quantas foram enviadas. Falhas ficam para a próxima tentativa.
 */
export async function sincronizarPausas(db: SQLiteDatabase): Promise<number> {
  if (!apiConfigurada) return 0;
  const pendentes = await listarPausasPendentes(db);
  let enviadas = 0;
  for (const pausa of pendentes) {
    try {
      await enviarPausa(pausa);
      await marcarPausaSincronizada(db, pausa.id);
      enviadas += 1;
    } catch {
      break;
    }
  }
  return enviadas;
}
