import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AvisoFonte, Carregando, Cartao, SeloNivel, Tela, Texto } from '@/components/ui';
import { ALTURA_MINIMA_TOQUE, Cores, Espaco, Fonte } from '@/constants/theme';
import { useLocalizacao } from '@/hooks/use-localizacao';
import { buscarPontos } from '@/services/api';
import { distanciaMetros, formatarDistancia, minutosAPe } from '@/services/calor';
import type { FonteDados, PontoRefresca } from '@/types';

type Filtro = 'todos' | 'banheiro' | 'sombra';

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'sombra', rotulo: 'Com sombra' },
  { valor: 'banheiro', rotulo: 'Com banheiro' },
];

export default function TelaPontos() {
  const db = useSQLiteContext();
  const { localizacao, carregando: buscandoLocal } = useLocalizacao();
  const [pontos, setPontos] = useState<PontoRefresca[] | null>(null);
  const [fonte, setFonte] = useState<FonteDados>('api');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    const resultado = await buscarPontos(db);
    setPontos(resultado.dados);
    setFonte(resultado.fonte);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const lista = useMemo(() => {
    if (!pontos) return [];
    return pontos
      .filter((p) => (filtro === 'banheiro' ? p.temBanheiro : filtro === 'sombra' ? p.temSombra : true))
      .map((p) => ({ ponto: p, distancia: distanciaMetros(localizacao, p) }))
      .sort((a, b) => a.distancia - b.distancia);
  }, [pontos, filtro, localizacao]);

  async function atualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  if (!pontos) {
    return (
      <Tela>
        <Carregando texto="Buscando pontos perto de você..." />
      </Tela>
    );
  }

  return (
    <Tela refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}>
      <AvisoFonte fonte={fonte} />

      {!buscandoLocal && !localizacao.real && (
        <Texto secundario>
          Sem acesso à sua localização. Distâncias contadas a partir do centro da Vila Mariana.
        </Texto>
      )}

      <View style={estilos.filtros} accessibilityRole="radiogroup" accessibilityLabel="Filtrar pontos">
        {FILTROS.map((f) => {
          const ativo = filtro === f.valor;
          return (
            <Pressable
              key={f.valor}
              onPress={() => setFiltro(f.valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={f.rotulo}
              style={[estilos.filtro, ativo && estilos.filtroAtivo]}>
              <Text style={[estilos.filtroTexto, ativo && estilos.filtroTextoAtivo]}>{f.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>

      {lista.length === 0 && <Texto>Nenhum ponto com esse filtro por aqui.</Texto>}

      {lista.map(({ ponto, distancia }) => (
        <Pressable
          key={ponto.id}
          onPress={() => router.push({ pathname: '/pontos/[id]', params: { id: String(ponto.id) } })}
          accessibilityRole="button"
          accessibilityLabel={`${ponto.nome}, a ${formatarDistancia(distancia)}, cerca de ${minutosAPe(distancia)} minutos a pé`}
          accessibilityHint="Abre os detalhes e o caminho até o ponto"
          style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <Cartao>
            <Text style={estilos.nome}>{ponto.nome}</Text>
            <Texto secundario>{ponto.endereco}</Texto>
            <Texto negrito>
              {formatarDistancia(distancia)} · {minutosAPe(distancia)} min a pé
            </Texto>
            <Texto>
              {[ponto.temAgua && 'Água', ponto.temSombra && 'Sombra', ponto.temBanheiro && 'Banheiro']
                .filter(Boolean)
                .join(' · ')}
            </Texto>
            {ponto.ultimaLeitura ? (
              <SeloNivel nivel={ponto.ultimaLeitura.nivel} indiceCalor={ponto.ultimaLeitura.indiceCalor} />
            ) : (
              <Texto secundario>Totem sem leitura recente</Texto>
            )}
          </Cartao>
        </Pressable>
      ))}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: Espaco.dois },
  filtro: {
    minHeight: ALTURA_MINIMA_TOQUE - 8,
    paddingHorizontal: Espaco.tres,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Cores.primaria,
    justifyContent: 'center',
  },
  filtroAtivo: { backgroundColor: Cores.primaria },
  filtroTexto: { fontSize: Fonte.base, fontWeight: '700', color: Cores.primaria },
  filtroTextoAtivo: { color: Cores.primariaTexto },
  nome: { fontSize: Fonte.media, fontWeight: '800', color: Cores.texto },
});
