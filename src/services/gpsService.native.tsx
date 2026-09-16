import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
 
import MapView, { Marker } from 'react-native-maps';
 
// IP do Raspberry Pi na rede local/Tailscale
const RASPBERRY_IP = '100.94.182.54';
 
// Endpoint do GPS no Raspberry Pi
const GPS_API_URL = `http://${RASPBERRY_IP}:5000/gps`;
 
export interface GpsData {
  fix: boolean;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  satellites: number;
  speed_kmh: number;
}
 
export const MapaRobo: React.FC = () => {
  const [gps, setGps] = useState<GpsData | null>(null);
  const [conectado, setConectado] = useState<boolean>(false);
 
  useEffect(() => {
    let montado = true;
 
    const buscarGps = async () => {
      try {
        const response = await fetch(GPS_API_URL);
 
        if (!response.ok) {
          throw new Error('Erro na resposta do servidor');
        }
 
        const dados = (await response.json()) as GpsData;
 
        if (montado) {
          setGps(dados);
          setConectado(true);
        }
      } catch (erro) {
        if (montado) {
          setConectado(false);
        }
      }
    };
 
    buscarGps();
 
    const intervalo = setInterval(buscarGps, 1000);
 
    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, []);
 
  const temCoordenadas =
    gps?.fix === true &&
    gps.latitude !== null &&
    gps.latitude !== undefined &&
    gps.longitude !== null &&
    gps.longitude !== undefined &&
    !isNaN(gps.latitude) &&
    !isNaN(gps.longitude);
 
  const statusMovimento =
    (gps?.speed_kmh ?? 0) > 0.5 ? 'EM MOVIMENTO' : 'PARADO';
 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Localização</Text>
 
        <Text style={styles.subtitulo}>
          Posição do robô via GPS
        </Text>
 
        <View style={styles.badgeStatus}>
          <Text style={styles.badgeText}>
            • {statusMovimento}
          </Text>
        </View>
      </View>
 
      {temCoordenadas ? (
        <MapView
          style={styles.mapa}
          region={{
            latitude: gps.latitude as number,
            longitude: gps.longitude as number,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          loadingEnabled={true}
        >
          <Marker
            coordinate={{
              latitude: gps.latitude as number,
              longitude: gps.longitude as number,
            }}
            title="Robô Leazor"
            description={`Velocidade: ${(gps.speed_kmh ?? 0).toFixed(
              1
            )} km/h`}
          />
        </MapView>
      ) : (
        <View style={styles.semSinalContainer}>
          <ActivityIndicator
            size="large"
            color="#4CAF50"
          />
 
          <Text style={styles.textoAviso}>
            {!conectado
              ? 'Conectando ao Raspberry Pi...'
              : 'Aguardando sinal dos satélites...'}
          </Text>
        </View>
      )}
 
      <View style={styles.painelTelemetria}>
        <Text style={styles.statusGps}>
          {gps?.fix
            ? '🟢 GPS conectado'
            : '🔴 Sem sinal de satélite'}{' '}
          • {gps?.satellites ?? 0} satélites
        </Text>
 
        <Text style={styles.coordenada}>
          Lat:{' '}
          {gps?.latitude !== null &&
          gps?.latitude !== undefined
            ? gps.latitude
            : 'Buscando...'}
        </Text>
 
        <Text style={styles.coordenada}>
          Long:{' '}
          {gps?.longitude !== null &&
          gps?.longitude !== undefined
            ? gps.longitude
            : 'Buscando...'}
        </Text>
 
        <Text style={styles.coordenada}>
          Altitude:{' '}
          {gps?.altitude !== null &&
          gps?.altitude !== undefined
            ? `${gps.altitude.toFixed(1)} m`
            : 'Buscando...'}
        </Text>
 
        <Text style={styles.coordenada}>
          Velocidade:{' '}
          {(gps?.speed_kmh ?? 0).toFixed(1)} km/h
        </Text>
      </View>
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
 
  header: {
    padding: 16,
  },
 
  titulo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
 
  subtitulo: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },
 
  badgeStatus: {
    backgroundColor: '#222222',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
 
  badgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
 
  mapa: {
    flex: 1,
  },
 
  semSinalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
 
  textoAviso: {
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
 
  painelTelemetria: {
    padding: 16,
    backgroundColor: '#0D0D0D',
  },
 
  statusGps: {
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
 
  coordenada: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },
});
 