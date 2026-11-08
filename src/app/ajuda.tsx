import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Linking, Platform } from 'react-native';

import { Botao, Cartao, Tela, Texto, Titulo } from '@/components/ui';
import { lerPerfil } from '@/db/database';
import type { Perfil } from '@/types';

export default function TelaAjuda() {
  const db = useSQLiteContext();
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useFocusEffect(
    useCallback(() => {
      lerPerfil(db).then(setPerfil);
    }, [db]),
  );

  const temContato = Boolean(perfil?.contatoTelefone);

  function ligarSamu() {
    Linking.openURL('tel:192');
  }

  function avisarContato() {
    if (!perfil?.contatoTelefone) return;
    const texto = encodeURIComponent(
      'Estou passando mal por causa do calor e preciso de ajuda. (Mensagem enviada pelo app Refresca)',
    );
    const telefone = perfil.contatoTelefone.replace(/[^\d+]/g, '');
    const separador = Platform.OS === 'ios' ? '&' : '?';
    Linking.openURL(`sms:${telefone}${separador}body=${texto}`);
  }

  return (
    <Tela>
      <Titulo>Está passando mal?</Titulo>
      <Texto>Tontura, dor de cabeça forte, enjoo ou confusão no calor são sinais de alerta.</Texto>

      <Botao
        titulo="Ligar para o SAMU (192)"
        variante="perigo"
        dica="Abre o discador com o número 192"
        aoPressionar={ligarSamu}
      />

      {temContato ? (
        <Botao
          titulo={`Avisar ${perfil?.contatoNome || 'meu contato'}`}
          dica="Abre uma mensagem de texto pronta para o seu contato de emergência"
          aoPressionar={avisarContato}
        />
      ) : (
        <Botao
          titulo="Cadastrar contato de emergência"
          variante="secundario"
          dica="Abre o perfil para cadastrar alguém de confiança"
          aoPressionar={() => router.push('/perfil')}
        />
      )}

      <Cartao>
        <Texto negrito>Enquanto a ajuda não chega</Texto>
        <Texto>1. Vá para a sombra ou um lugar fresco.</Texto>
        <Texto>2. Beba água aos poucos, se conseguir engolir.</Texto>
        <Texto>3. Molhe o rosto, a nuca e os braços.</Texto>
        <Texto>4. Afrouxe a roupa e descanse sentado ou deitado.</Texto>
      </Cartao>

      <Botao
        titulo="Ver o ponto de sombra mais perto"
        variante="secundario"
        aoPressionar={() => router.push('/pontos')}
      />
    </Tela>
  );
}
