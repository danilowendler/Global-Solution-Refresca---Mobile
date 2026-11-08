import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import {
  AvisoFonte,
  Botao,
  Carregando,
  Cartao,
  ItemSimNao,
  SeloNivel,
  Tela,
  Texto,
  Titulo,
} from '@/components/ui';
import { buscarPonto } from '@/services/api';
import { formatarHora } from '@/services/calor';
import type { FonteDados, PontoRefresca } from '@/types';

export default function TelaDetalhePonto() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ponto, setPonto] = useState<PontoRefresca | null | undefined>(undefined);
  const [fonte, setFonte] = useState<FonteDados>('api');

  useEffect(() => {
    buscarPonto(db, Number(id)).then((resultado) => {
      setPonto(resultado.dados);
      setFonte(resultado.fonte);
    });
  }, [db, id]);

  if (ponto === undefined) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  if (ponto === null) {
    return (
      <Tela>
        <Texto>Não encontramos este ponto. Volte e escolha outro da lista.</Texto>
      </Tela>
    );
  }

  function abrirCaminho(destino: PontoRefresca) {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${destino.latitude},${destino.longitude}`;
    Linking.openURL(url);
  }

  return (
    <Tela>
      <Stack.Screen options={{ title: ponto.nome }} />
      <AvisoFonte fonte={fonte} />

      <Titulo>{ponto.nome}</Titulo>
      <Texto>{ponto.endereco}</Texto>
      <Texto secundario>Funciona: {ponto.horario}</Texto>

      <Cartao>
        <Texto negrito>Calor medido pelo totem</Texto>
        {ponto.ultimaLeitura ? (
          <>
            <SeloNivel
              nivel={ponto.ultimaLeitura.nivel}
              indiceCalor={ponto.ultimaLeitura.indiceCalor}
              grande
            />
            <Texto secundario>Leitura das {formatarHora(ponto.ultimaLeitura.medidoEm)}</Texto>
          </>
        ) : (
          <Texto>O totem deste ponto ainda não enviou leitura hoje.</Texto>
        )}
      </Cartao>

      <Cartao>
        <Texto negrito>O que tem aqui</Texto>
        <ItemSimNao rotulo="Água grátis" valor={ponto.temAgua} />
        <ItemSimNao rotulo="Sombra para descansar" valor={ponto.temSombra} />
        <ItemSimNao rotulo="Banheiro liberado" valor={ponto.temBanheiro} />
      </Cartao>

      <Botao
        titulo="Como chegar a pé"
        dica="Abre o mapa do celular com o caminho até o ponto"
        aoPressionar={() => abrirCaminho(ponto)}
      />
    </Tela>
  );
}
