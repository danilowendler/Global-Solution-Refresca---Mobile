import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ALTURA_MINIMA_TOQUE, Cores, CoresNivel, Espaco, Fonte } from '@/constants/theme';
import { DICA_NIVEL, ROTULO_NIVEL } from '@/services/calor';
import type { FonteDados, NivelCalor } from '@/types';

/* ---------- Tela ---------- */

export function Tela({
  children,
  refreshControl,
}: {
  children: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  return (
    <SafeAreaView style={estilos.tela} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={estilos.conteudo} refreshControl={refreshControl}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <View style={estilos.carregando} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={Cores.primaria} />
      <Texto>{texto}</Texto>
    </View>
  );
}

/* ---------- Texto ---------- */

export function Titulo({ children }: { children: ReactNode }) {
  return (
    <Text style={estilos.titulo} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Texto({
  children,
  secundario = false,
  negrito = false,
}: {
  children: ReactNode;
  secundario?: boolean;
  negrito?: boolean;
}) {
  return (
    <Text
      style={[
        estilos.texto,
        secundario && { color: Cores.textoSecundario },
        negrito && { fontWeight: '700' },
      ]}>
      {children}
    </Text>
  );
}

/* ---------- Botão ---------- */

type VarianteBotao = 'primario' | 'secundario' | 'perigo';

export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  dica,
  desabilitado = false,
}: {
  titulo: string;
  aoPressionar: () => void;
  variante?: VarianteBotao;
  dica?: string;
  desabilitado?: boolean;
}) {
  const cores = {
    primario: { fundo: Cores.primaria, texto: Cores.primariaTexto, borda: Cores.primaria },
    secundario: { fundo: Cores.fundo, texto: Cores.primaria, borda: Cores.primaria },
    perigo: { fundo: Cores.perigoAcao, texto: Cores.perigoAcaoTexto, borda: Cores.perigoAcao },
  }[variante];

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: cores.fundo, borderColor: cores.borda },
        pressed && { opacity: 0.8 },
        desabilitado && { opacity: 0.5 },
      ]}>
      <Text style={[estilos.botaoTexto, { color: cores.texto }]}>{titulo}</Text>
    </Pressable>
  );
}

/* ---------- Cartão ---------- */

export function Cartao({
  children,
  estilo,
}: {
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
}) {
  return <View style={[estilos.cartao, estilo]}>{children}</View>;
}

/* ---------- Nível de calor ---------- */

export function SeloNivel({
  nivel,
  indiceCalor,
  grande = false,
}: {
  nivel: NivelCalor;
  indiceCalor?: number;
  grande?: boolean;
}) {
  const cores = CoresNivel[nivel];
  const valor = indiceCalor !== undefined ? `${indiceCalor.toFixed(1).replace('.', ',')} °C` : '';
  const rotulo = `Nível ${ROTULO_NIVEL[nivel]}${valor ? `, índice de calor ${valor}` : ''}`;

  return (
    <View
      accessible
      accessibilityLabel={rotulo}
      style={[
        estilos.selo,
        { backgroundColor: cores.fundo, borderColor: cores.borda },
        grande && estilos.seloGrande,
      ]}>
      <Text style={[estilos.seloTexto, { color: cores.texto }, grande && estilos.seloTextoGrande]}>
        {ROTULO_NIVEL[nivel].toUpperCase()}
        {valor ? ` · ${valor}` : ''}
      </Text>
      {grande && <Text style={[estilos.seloDica, { color: cores.texto }]}>{DICA_NIVEL[nivel]}</Text>}
    </View>
  );
}

/* ---------- Aviso de origem dos dados ---------- */

export function AvisoFonte({ fonte }: { fonte: FonteDados }) {
  if (fonte === 'api') return null;
  const texto =
    fonte === 'cache'
      ? 'Sem conexão. Mostrando os últimos dados salvos no aparelho.'
      : 'Modo demonstração: dados simulados, porque a API não está disponível.';
  return (
    <View style={estilos.aviso} accessibilityRole="alert">
      <Text style={estilos.avisoTexto}>{texto}</Text>
    </View>
  );
}

/* ---------- Item com sim ou não ---------- */

export function ItemSimNao({ rotulo, valor }: { rotulo: string; valor: boolean }) {
  return (
    <View
      style={estilos.itemSimNao}
      accessible
      accessibilityLabel={`${rotulo}: ${valor ? 'sim' : 'não'}`}>
      <Text style={estilos.texto}>{rotulo}</Text>
      <Text style={[estilos.texto, { fontWeight: '700', color: valor ? Cores.sucesso : Cores.textoSecundario }]}>
        {valor ? 'Sim' : 'Não'}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  conteudo: { padding: Espaco.tres, gap: Espaco.tres, paddingBottom: Espaco.cinco },
  carregando: { padding: Espaco.cinco, alignItems: 'center', gap: Espaco.tres },
  titulo: { fontSize: Fonte.titulo, fontWeight: '800', color: Cores.texto },
  texto: { fontSize: Fonte.base, lineHeight: 26, color: Cores.texto },
  botao: {
    minHeight: ALTURA_MINIMA_TOQUE,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: Espaco.tres,
    paddingVertical: Espaco.dois,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { fontSize: Fonte.media, fontWeight: '700', textAlign: 'center' },
  cartao: {
    backgroundColor: Cores.fundoCartao,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Cores.borda,
    padding: Espaco.tres,
    gap: Espaco.dois,
  },
  selo: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 2,
    paddingHorizontal: Espaco.dois,
    paddingVertical: Espaco.um,
  },
  seloGrande: { alignSelf: 'stretch', padding: Espaco.tres, gap: Espaco.dois },
  seloTexto: { fontSize: Fonte.pequena, fontWeight: '800' },
  seloTextoGrande: { fontSize: Fonte.grande },
  seloDica: { fontSize: Fonte.base, lineHeight: 26 },
  aviso: {
    backgroundColor: '#FFF1CC',
    borderColor: '#8A5A00',
    borderWidth: 1,
    borderRadius: 10,
    padding: Espaco.dois,
  },
  avisoTexto: { fontSize: Fonte.pequena, color: '#5C3B00' },
  itemSimNao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Espaco.um,
  },
});
