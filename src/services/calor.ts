import type { NivelCalor } from '@/types';

/**
 * Faixas do índice de calor usadas em toda a Refresca (totem, API e app),
 * baseadas nas faixas da NOAA.
 */
export const LIMITE_ATENCAO = 27;
export const LIMITE_PERIGO = 32;

export function nivelPorIndice(indiceCalor: number): NivelCalor {
  if (indiceCalor >= LIMITE_PERIGO) return 'perigo';
  if (indiceCalor >= LIMITE_ATENCAO) return 'atencao';
  return 'normal';
}

export const ROTULO_NIVEL: Record<NivelCalor, string> = {
  normal: 'Normal',
  atencao: 'Atenção',
  perigo: 'Perigo',
};

export const DICA_NIVEL: Record<NivelCalor, string> = {
  normal: 'Mantenha a garrafa de água por perto.',
  atencao: 'Beba água a cada 30 minutos e procure sombra quando puder.',
  perigo: 'Calor perigoso. Faça pausas na sombra e beba água mesmo sem sede.',
};

/** Intervalo sugerido entre pausas, em minutos, conforme o alerta do dia. */
export function intervaloPausaMin(diaPerigoso: boolean): number {
  return diaPerigoso ? 60 : 120;
}

/** Distância em metros entre dois pontos (fórmula de Haversine). */
export function distanciaMetros(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const raioTerra = 6_371_000;
  const rad = (graus: number) => (graus * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * raioTerra * Math.asin(Math.sqrt(h));
}

export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros / 10) * 10} m`;
  return `${(metros / 1000).toFixed(1).replace('.', ',')} km`;
}

/** Tempo a pé aproximado, considerando 80 metros por minuto. */
export function minutosAPe(metros: number): number {
  return Math.max(1, Math.round(metros / 80));
}

export function formatarHora(iso: string): string {
  const data = new Date(iso);
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatarData(iso: string): string {
  const data = new Date(iso);
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function minutosDesde(iso: string, agora = new Date()): number {
  return Math.floor((agora.getTime() - new Date(iso).getTime()) / 60_000);
}
