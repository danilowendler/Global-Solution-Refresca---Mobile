import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Cores, Fonte } from '@/constants/theme';
import { migrarBanco, NOME_BANCO } from '@/db/database';

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName={NOME_BANCO} onInit={migrarBanco}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Cores.fundo },
            headerTintColor: Cores.primaria,
            headerTitleStyle: { fontSize: Fonte.media, fontWeight: '700', color: Cores.texto },
            headerBackTitle: 'Voltar',
            contentStyle: { backgroundColor: Cores.fundo },
          }}>
          <Stack.Screen name="index" options={{ title: 'Refresca' }} />
          <Stack.Screen name="pontos/index" options={{ title: 'Água e sombra perto de você' }} />
          <Stack.Screen name="pontos/[id]" options={{ title: 'Ponto Refresca' }} />
          <Stack.Screen name="pausas" options={{ title: 'Minhas pausas' }} />
          <Stack.Screen name="ajuda" options={{ title: 'Preciso de ajuda' }} />
          <Stack.Screen name="perfil" options={{ title: 'Meu perfil' }} />
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
