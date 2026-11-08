import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { CENTRO_VILA_MARIANA } from '@/constants/theme';

export interface Localizacao {
  latitude: number;
  longitude: number;
  /** true quando é a posição real do aparelho; false quando é o centro da Vila Mariana. */
  real: boolean;
}

/**
 * Localização do trabalhador, usada só para ordenar os pontos por distância.
 * A posição fica no aparelho e não é enviada para a API.
 */
export function useLocalizacao(): { localizacao: Localizacao; carregando: boolean } {
  const [localizacao, setLocalizacao] = useState<Localizacao>({
    ...CENTRO_VILA_MARIANA,
    real: false,
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function obter() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const posicao = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (ativo) {
          setLocalizacao({
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
            real: true,
          });
        }
      } catch {
        // Sem GPS ou permissão negada: segue com o centro da Vila Mariana.
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    obter();
    return () => {
      ativo = false;
    };
  }, []);

  return { localizacao, carregando };
}
