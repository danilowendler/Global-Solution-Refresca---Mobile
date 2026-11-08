import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Botao, Cartao, Tela, Texto, Titulo } from '@/components/ui';
import { ALTURA_MINIMA_TOQUE, Cores, Espaco, Fonte } from '@/constants/theme';
import { apagarPausa, inserirPausa, listarPausas } from '@/db/database';
import { sincronizarPausas } from '@/services/api';
import { formatarData, formatarHora } from '@/services/calor';
import type { Pausa } from '@/types';

const DURACOES = [5, 10, 15];

export default function TelaPausas() {
  const db = useSQLiteContext();
  const [pausas, setPausas] = useState<Pausa[]>([]);
  const [duracao, setDuracao] = useState(10);
  const [bebeuAgua, setBebeuAgua] = useState(true);
  const [mensagem, setMensagem] = useState('');

  const carregar = useCallback(async () => {
    setPausas(await listarPausas(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function registrar() {
    await inserirPausa(db, duracao, bebeuAgua);
    const enviadas = await sincronizarPausas(db);
    setMensagem(
      enviadas > 0
        ? 'Pausa registrada e enviada. Bom descanso!'
        : 'Pausa registrada no aparelho. Bom descanso!',
    );
    await carregar();
  }

  function confirmarExclusao(pausa: Pausa) {
    Alert.alert('Apagar pausa', `Apagar a pausa das ${formatarHora(pausa.registradaEm)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await apagarPausa(db, pausa.id);
          await carregar();
        },
      },
    ]);
  }

  return (
    <Tela>
      <Cartao>
        <Titulo>Nova pausa</Titulo>
        <Texto>Quanto tempo você vai descansar?</Texto>
        <View style={estilos.opcoes} accessibilityRole="radiogroup" accessibilityLabel="Duração da pausa">
          {DURACOES.map((min) => {
            const ativo = duracao === min;
            return (
              <Pressable
                key={min}
                onPress={() => setDuracao(min)}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativo }}
                accessibilityLabel={`${min} minutos`}
                style={[estilos.opcao, ativo && estilos.opcaoAtiva]}>
                <Text style={[estilos.opcaoTexto, ativo && estilos.opcaoTextoAtivo]}>{min} min</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={estilos.linhaSwitch}>
          <Text style={estilos.rotuloSwitch} nativeID="rotulo-agua">
            Bebi água nesta pausa
          </Text>
          <Switch
            value={bebeuAgua}
            onValueChange={setBebeuAgua}
            accessibilityLabelledBy="rotulo-agua"
            accessibilityLabel="Bebi água nesta pausa"
            trackColor={{ true: Cores.primaria, false: Cores.borda }}
          />
        </View>

        <Botao titulo="Registrar pausa agora" aoPressionar={registrar} />
        {mensagem !== '' && (
          <Text style={estilos.mensagem} accessibilityLiveRegion="polite" accessibilityRole="alert">
            {mensagem}
          </Text>
        )}
      </Cartao>

      <Titulo>Histórico</Titulo>
      {pausas.length === 0 && <Texto secundario>Nenhuma pausa registrada ainda.</Texto>}
      {pausas.map((pausa) => (
        <Cartao key={pausa.id}>
          <Texto negrito>
            {formatarData(pausa.registradaEm)}, {formatarHora(pausa.registradaEm)}
          </Texto>
          <Texto>
            {pausa.duracaoMin} minutos · {pausa.bebeuAgua ? 'bebeu água' : 'sem água'}
          </Texto>
          <Texto secundario>{pausa.sincronizada ? 'Enviada para a Refresca' : 'Salva só no aparelho'}</Texto>
          <Botao
            titulo="Apagar"
            variante="secundario"
            dica="Remove esta pausa do histórico"
            aoPressionar={() => confirmarExclusao(pausa)}
          />
        </Cartao>
      ))}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  opcoes: { flexDirection: 'row', gap: Espaco.dois },
  opcao: {
    flex: 1,
    minHeight: ALTURA_MINIMA_TOQUE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoAtiva: { backgroundColor: Cores.primaria },
  opcaoTexto: { fontSize: Fonte.media, fontWeight: '700', color: Cores.primaria },
  opcaoTextoAtivo: { color: Cores.primariaTexto },
  linhaSwitch: {
    minHeight: ALTURA_MINIMA_TOQUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rotuloSwitch: { fontSize: Fonte.base, color: Cores.texto, flex: 1 },
  mensagem: { fontSize: Fonte.base, fontWeight: '700', color: Cores.sucesso },
});
