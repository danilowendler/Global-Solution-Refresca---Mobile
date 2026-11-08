/**
 * Tema da Refresca.
 *
 * Cores escolhidas para alto contraste (texto sobre fundo com razão de contraste
 * de pelo menos 4,5:1, recomendação WCAG AA). O nível de calor nunca é mostrado
 * só pela cor: sempre vem acompanhado de texto.
 */

export const Cores = {
  fundo: '#FFFFFF',
  fundoCartao: '#F3F5F8',
  borda: '#C9D1DB',
  texto: '#111418',
  textoSecundario: '#44505C',
  primaria: '#0B5CAD',
  primariaTexto: '#FFFFFF',
  perigoAcao: '#B3261E',
  perigoAcaoTexto: '#FFFFFF',
  sucesso: '#1B6E35',
} as const;

export const CoresNivel = {
  normal: { fundo: '#E3F4E8', texto: '#14532B', borda: '#1B6E35' },
  atencao: { fundo: '#FFF1CC', texto: '#5C3B00', borda: '#8A5A00' },
  perigo: { fundo: '#FDE7E5', texto: '#7A1712', borda: '#B3261E' },
} as const;

export const Fonte = {
  pequena: 16,
  base: 18,
  media: 20,
  grande: 24,
  titulo: 28,
  destaque: 40,
} as const;

export const Espaco = {
  um: 4,
  dois: 8,
  tres: 16,
  quatro: 24,
  cinco: 32,
} as const;

/** Área mínima de toque, maior que os 48 dp recomendados, para uso na rua e com luvas. */
export const ALTURA_MINIMA_TOQUE = 56;

/** Centro aproximado da Vila Mariana, usado quando a localização não é permitida. */
export const CENTRO_VILA_MARIANA = { latitude: -23.5893, longitude: -46.6346 };
