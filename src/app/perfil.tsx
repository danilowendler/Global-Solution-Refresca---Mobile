import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Botao, Cartao, Tela, Texto, Titulo } from '@/components/ui';
import { ALTURA_MINIMA_TOQUE, Cores, Espaco, Fonte } from '@/constants/theme';
import { apagarPerfil, lerPerfil, salvarPerfil } from '@/db/database';
import type { Perfil } from '@/types';

const TIPOS_TRABALHO = ['Entregador', 'Ambulante', 'Gari', 'Banca ou feira', 'Outro'];

const PERFIL_VAZIO: Perfil = { apelido: '', tipoTrabalho: '', contatoNome: '', contatoTelefone: '' };

export default function TelaPerfil() {
  const db = useSQLiteContext();
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    lerPerfil(db).then((salvo) => setPerfil(salvo ?? PERFIL_VAZIO));
  }, [db]);

  function alterar<K extends keyof Perfil>(campo: K, valor: Perfil[K]) {
    setPerfil((atual) => ({ ...atual, [campo]: valor }));
    setMensagem('');
  }

  async function salvar() {
    const digitos = perfil.contatoTelefone.replace(/\D/g, '');
    if (perfil.contatoTelefone && (digitos.length < 10 || digitos.length > 13)) {
      setMensagem('Confira o telefone: use DDD + número, por exemplo 11 91234-5678.');
      return;
    }
    await salvarPerfil(db, perfil);
    setMensagem('Perfil salvo neste aparelho.');
  }

  function confirmarApagar() {
    Alert.alert('Apagar meus dados', 'Apagar apelido e contato de emergência deste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await apagarPerfil(db);
          setPerfil(PERFIL_VAZIO);
          setMensagem('Seus dados foram apagados.');
        },
      },
    ]);
  }

  return (
    <Tela>
      <Cartao>
        <Texto negrito>Seus dados ficam só neste celular</Texto>
        <Texto secundario>
          O contato de emergência não é enviado para a Refresca. Use um apelido, não precisa do nome completo.
        </Texto>
      </Cartao>

      <Campo
        rotulo="Como quer ser chamado"
        valor={perfil.apelido}
        aoAlterar={(v) => alterar('apelido', v)}
        exemplo="Ex.: Marcão"
      />

      <View style={{ gap: Espaco.dois }}>
        <Text style={estilos.rotulo}>Seu trabalho</Text>
        <View style={estilos.opcoes} accessibilityRole="radiogroup" accessibilityLabel="Seu trabalho">
          {TIPOS_TRABALHO.map((tipo) => {
            const ativo = perfil.tipoTrabalho === tipo;
            return (
              <Pressable
                key={tipo}
                onPress={() => alterar('tipoTrabalho', tipo)}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativo }}
                accessibilityLabel={tipo}
                style={[estilos.opcao, ativo && estilos.opcaoAtiva]}>
                <Text style={[estilos.opcaoTexto, ativo && estilos.opcaoTextoAtivo]}>{tipo}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Titulo>Contato de emergência</Titulo>
      <Campo
        rotulo="Nome do contato"
        valor={perfil.contatoNome}
        aoAlterar={(v) => alterar('contatoNome', v)}
        exemplo="Ex.: Ana (esposa)"
      />
      <Campo
        rotulo="Telefone com DDD"
        valor={perfil.contatoTelefone}
        aoAlterar={(v) => alterar('contatoTelefone', v)}
        exemplo="Ex.: 11 91234-5678"
        teclado="phone-pad"
      />

      <Botao titulo="Salvar" aoPressionar={salvar} />
      {mensagem !== '' && (
        <Text style={estilos.mensagem} accessibilityLiveRegion="polite" accessibilityRole="alert">
          {mensagem}
        </Text>
      )}
      <Botao titulo="Apagar meus dados" variante="secundario" aoPressionar={confirmarApagar} />
    </Tela>
  );
}

function Campo({
  rotulo,
  valor,
  aoAlterar,
  exemplo,
  teclado = 'default',
}: {
  rotulo: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  exemplo: string;
  teclado?: 'default' | 'phone-pad';
}) {
  return (
    <View style={{ gap: Espaco.dois }}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        value={valor}
        onChangeText={aoAlterar}
        placeholder={exemplo}
        placeholderTextColor={Cores.textoSecundario}
        keyboardType={teclado}
        accessibilityLabel={rotulo}
        style={estilos.campo}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  rotulo: { fontSize: Fonte.base, fontWeight: '700', color: Cores.texto },
  campo: {
    minHeight: ALTURA_MINIMA_TOQUE,
    borderWidth: 2,
    borderColor: Cores.borda,
    borderRadius: 12,
    paddingHorizontal: Espaco.tres,
    fontSize: Fonte.base,
    color: Cores.texto,
    backgroundColor: Cores.fundo,
  },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: Espaco.dois },
  opcao: {
    minHeight: ALTURA_MINIMA_TOQUE - 8,
    paddingHorizontal: Espaco.tres,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Cores.primaria,
    justifyContent: 'center',
  },
  opcaoAtiva: { backgroundColor: Cores.primaria },
  opcaoTexto: { fontSize: Fonte.base, fontWeight: '700', color: Cores.primaria },
  opcaoTextoAtivo: { color: Cores.primariaTexto },
  mensagem: { fontSize: Fonte.base, fontWeight: '700', color: Cores.texto },
});
