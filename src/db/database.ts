import type { SQLiteDatabase } from 'expo-sqlite';

import type { Pausa, Perfil, PontoRefresca } from '@/types';

/**
 * Banco local (SQLite) da Refresca.
 *
 * Guarda no aparelho:
 * - perfil: apelido e contato de emergência (nunca enviados para a API);
 * - pausas: pausas de hidratação registradas, com marcação de sincronização;
 * - pontos_cache: última lista de pontos recebida, para funcionar sem internet.
 */

export const NOME_BANCO = 'refresca.db';
const VERSAO_ATUAL = 1;

/** Cria as tabelas na primeira abertura e aplica migrações por versão. */
export async function migrarBanco(db: SQLiteDatabase): Promise<void> {
  const linha = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let versao = linha?.user_version ?? 0;

  if (versao >= VERSAO_ATUAL) return;

  if (versao === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS perfil (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        apelido TEXT NOT NULL DEFAULT '',
        tipo_trabalho TEXT NOT NULL DEFAULT '',
        contato_nome TEXT NOT NULL DEFAULT '',
        contato_telefone TEXT NOT NULL DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS pausas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registrada_em TEXT NOT NULL,
        duracao_min INTEGER NOT NULL,
        bebeu_agua INTEGER NOT NULL,
        sincronizada INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS pontos_cache (
        id INTEGER PRIMARY KEY,
        json TEXT NOT NULL,
        atualizado_em TEXT NOT NULL
      );
    `);
    versao = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${versao}`);
}

/* ---------- Perfil ---------- */

interface LinhaPerfil {
  apelido: string;
  tipo_trabalho: string;
  contato_nome: string;
  contato_telefone: string;
}

export async function lerPerfil(db: SQLiteDatabase): Promise<Perfil | null> {
  const linha = await db.getFirstAsync<LinhaPerfil>(
    'SELECT apelido, tipo_trabalho, contato_nome, contato_telefone FROM perfil WHERE id = 1',
  );
  if (!linha) return null;
  return {
    apelido: linha.apelido,
    tipoTrabalho: linha.tipo_trabalho,
    contatoNome: linha.contato_nome,
    contatoTelefone: linha.contato_telefone,
  };
}

export async function salvarPerfil(db: SQLiteDatabase, perfil: Perfil): Promise<void> {
  await db.runAsync(
    `INSERT INTO perfil (id, apelido, tipo_trabalho, contato_nome, contato_telefone)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       apelido = excluded.apelido,
       tipo_trabalho = excluded.tipo_trabalho,
       contato_nome = excluded.contato_nome,
       contato_telefone = excluded.contato_telefone`,
    perfil.apelido.trim(),
    perfil.tipoTrabalho.trim(),
    perfil.contatoNome.trim(),
    perfil.contatoTelefone.trim(),
  );
}

export async function apagarPerfil(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM perfil WHERE id = 1');
}

/* ---------- Pausas ---------- */

interface LinhaPausa {
  id: number;
  registrada_em: string;
  duracao_min: number;
  bebeu_agua: number;
  sincronizada: number;
}

function paraPausa(linha: LinhaPausa): Pausa {
  return {
    id: linha.id,
    registradaEm: linha.registrada_em,
    duracaoMin: linha.duracao_min,
    bebeuAgua: linha.bebeu_agua === 1,
    sincronizada: linha.sincronizada === 1,
  };
}

export async function inserirPausa(
  db: SQLiteDatabase,
  duracaoMin: number,
  bebeuAgua: boolean,
): Promise<Pausa> {
  const registradaEm = new Date().toISOString();
  const resultado = await db.runAsync(
    'INSERT INTO pausas (registrada_em, duracao_min, bebeu_agua) VALUES (?, ?, ?)',
    registradaEm,
    duracaoMin,
    bebeuAgua ? 1 : 0,
  );
  return {
    id: resultado.lastInsertRowId,
    registradaEm,
    duracaoMin,
    bebeuAgua,
    sincronizada: false,
  };
}

export async function listarPausas(db: SQLiteDatabase): Promise<Pausa[]> {
  const linhas = await db.getAllAsync<LinhaPausa>(
    'SELECT * FROM pausas ORDER BY registrada_em DESC LIMIT 100',
  );
  return linhas.map(paraPausa);
}

export async function listarPausasDeHoje(db: SQLiteDatabase): Promise<Pausa[]> {
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);
  const linhas = await db.getAllAsync<LinhaPausa>(
    'SELECT * FROM pausas WHERE registrada_em >= ? ORDER BY registrada_em DESC',
    inicioDoDia.toISOString(),
  );
  return linhas.map(paraPausa);
}

export async function listarPausasPendentes(db: SQLiteDatabase): Promise<Pausa[]> {
  const linhas = await db.getAllAsync<LinhaPausa>(
    'SELECT * FROM pausas WHERE sincronizada = 0 ORDER BY registrada_em',
  );
  return linhas.map(paraPausa);
}

export async function marcarPausaSincronizada(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('UPDATE pausas SET sincronizada = 1 WHERE id = ?', id);
}

export async function apagarPausa(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM pausas WHERE id = ?', id);
}

/* ---------- Cache de pontos ---------- */

export async function salvarPontosNoCache(
  db: SQLiteDatabase,
  pontos: PontoRefresca[],
): Promise<void> {
  const agora = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM pontos_cache');
    for (const ponto of pontos) {
      await db.runAsync(
        'INSERT INTO pontos_cache (id, json, atualizado_em) VALUES (?, ?, ?)',
        ponto.id,
        JSON.stringify(ponto),
        agora,
      );
    }
  });
}

export async function lerPontosDoCache(db: SQLiteDatabase): Promise<PontoRefresca[]> {
  const linhas = await db.getAllAsync<{ json: string }>(
    'SELECT json FROM pontos_cache ORDER BY id',
  );
  return linhas.map((linha) => JSON.parse(linha.json) as PontoRefresca);
}
