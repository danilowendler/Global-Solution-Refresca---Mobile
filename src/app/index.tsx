import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import {
  AvisoFonte,
  Botao,
  Carregando,
  Cartao,
  SeloNivel,
  Tela,
  Texto,
  Titulo,
} from '@/components/ui';
import { Cores, CoresNivel, Fonte } from '@/constants/theme';
import { lerPerfil, listarPausasDeHoje } from '@/db/database';
import { buscarAlertaHoje, buscarPontos, sincronizarPausas } from '@/services/api';
import { formatarData, intervaloPausaMin, minutosDesde } from '@/services/calor';
import type { AlertaHoje, FonteDados, Pausa, PontoRefresca } from '@/types';

export default function TelaHoje() {
  const db = useSQLiteContext();
  const [alerta, setAlerta] = useState<AlertaHoje | null>(null);
  const [fonte, setFonte] = useState<FonteDados>('api');
  const [pontoMaisQuente, setPontoMaisQuente] = useState<PontoRefresca | null>(null);
  const [pausasHoje, setPausasHoje] = useState<Pausa[]>([]);
  const [apelido, setApelido] = useState('');
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    const [resAlerta, resPontos, pausas, perfil] = await Promise.all([
      buscarAlertaHoje(),
      buscarPontos(db),
      listarPausasDeHoje(db),
      lerPerfil(db),
    ]);
    setAlerta(resAlerta.dados);
    setFonte(resAlerta.fonte === 'api' ? resPontos.fonte : resAlerta.fonte);
    const comLeitura = resPontos.dados.filter((p) => p.ultimaLeitura !== null);
    comLeitura.sort((a, b) => b.ultimaLeitura!.indiceCalor - a.ultimaLeitura!.indiceCalor);
    setPontoMaisQuente(comLeitura[0] ?? null);
    setPausasHoje(pausas);
    setApelido(perfil?.apelido ?? '');
    sincronizarPausas(db).catch(() => undefined);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function atualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  if (!alerta) {
    return (
      <Tela>
        <Carregando texto="Buscando o alerta de hoje..." />
      </Tela>
    );
  }

  const nivelDia = alerta.perigoso ? 'perigo' : 'normal';
  const intervalo = intervaloPausaMin(alerta.perigoso);
  const ultimaPausa = pausasHoje[0];
  const minutosSemPausa = ultimaPausa ? minutosDesde(ultimaPausa.registradaEm) : null;
  const horaDePausa = minutosSemPausa === null || minutosSemPausa >= intervalo;

  return (
    <Tela refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}>
      <AvisoFonte fonte={fonte} />

      <View>
        <Titulo>{apelido ? `Olá, ${apelido}` : 'Olá'}</Titulo>
        <Texto secundario>{formatarData(alerta.data + 'T12:00:00')}</Texto>
      </View>

      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={`Alerta de hoje: ${alerta.perigoso ? 'calor perigoso' : 'sem alerta de calor'}. ${alerta.mensagem}`}
        style={[
          estilos.alerta,
          { backgroundColor: CoresNivel[nivelDia].fundo, borderColor: CoresNivel[nivelDia].borda },
        ]}>
        <Text style={[estilos.alertaTitulo, { color: CoresNivel[nivelDia].texto }]}>
          {alerta.perigoso ? 'Alerta: calor perigoso hoje' : 'Sem alerta de calor hoje'}
        </Text>
        <Text style={[estilos.alertaTexto, { color: CoresNivel[nivelDia].texto }]}>
          {alerta.mensagem}
        </Text>
      </View>

      <Cartao>
        <Texto negrito>Pausa para água</Texto>
        {horaDePausa ? (
          <Texto>
            {ultimaPausa
              ? `Sua última pausa foi há ${minutosSemPausa} minutos. Hora de beber água na sombra.`
              : 'Você ainda não registrou pausa hoje. Que tal beber água agora?'}
          </Texto>
        ) : (
          <Texto>
            Próxima pausa sugerida em {intervalo - (minutosSemPausa ?? 0)} minutos.
          </Texto>
        )}
        <Texto secundario>
          {pausasHoje.length} {pausasHoje.length === 1 ? 'pausa registrada' : 'pausas registradas'} hoje
        </Texto>
        <Botao
          titulo="Registrar pausa"
          dica="Abre a tela para registrar uma pausa de hidratação"
          aoPressionar={() => router.push('/pausas')}
        />
      </Cartao>

      {pontoMaisQuente?.ultimaLeitura && (
        <Cartao>
          <Texto negrito>Calor medido agora no bairro</Texto>
          <SeloNivel
            nivel={pontoMaisQuente.ultimaLeitura.nivel}
            indiceCalor={pontoMaisQuente.ultimaLeitura.indiceCalor}
            grande
          />
          <Texto secundario>Maior leitura dos totens: {pontoMaisQuente.nome}</Texto>
        </Cartao>
      )}

      <Botao
        titulo="Ver água e sombra perto de mim"
        dica="Abre a lista de Pontos Refresca ordenada por distância"
        aoPressionar={() => router.push('/pontos')}
      />
      <Botao
        titulo="Preciso de ajuda"
        variante="perigo"
        dica="Abre as opções para ligar para o SAMU ou avisar seu contato"
        aoPressionar={() => router.push('/ajuda')}
      />
      <Botao
        titulo="Meu perfil"
        variante="secundario"
        dica="Abre o cadastro de apelido e contato de emergência"
        aoPressionar={() => router.push('/perfil')}
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  alerta: { borderWidth: 2, borderRadius: 16, padding: 16, gap: 8 },
  alertaTitulo: { fontSize: Fonte.grande, fontWeight: '800' },
  alertaTexto: { fontSize: Fonte.base, lineHeight: 26, color: Cores.texto },
});
