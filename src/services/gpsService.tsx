import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

// Coordenadas e dados fixos solicitados
const ENDERECO_FIXO = "Av. Manuel Bandeira, 360 - Vila Leopoldina, São Paulo - SP, 05317-020";
const LATITUDE_FIXA = -23.5403;
const LONGITUDE_FIXA = -46.7338;

export const MapaRobo: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Cabeçalho de Status */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Localização</Text>
        <Text style={styles.subtitulo}>{ENDERECO_FIXO}</Text>
        <View style={styles.badgeStatus}>
          <Text style={styles.badgeText}>• ENDEREÇO </Text>
        </View>
      </View>

      {/* Conteúdo específico para Web */}
      {Platform.OS === 'web' ? (
        <View style={styles.webContainer}>
          <Text style={styles.webTitulo}>Localização</Text>
          <Text style={styles.webTexto}>{ENDERECO_FIXO}</Text>
          
          <View style={styles.webGpsCard}>
            <Text style={styles.statusGps}>🟢 Localização </Text>
            <Text style={styles.coordenada}>Latitude: {LATITUDE_FIXA}</Text>
            <Text style={styles.coordenada}>Longitude: {LONGITUDE_FIXA}</Text>
            <Text style={styles.coordenada}>Status: Operando na base principal</Text>
          </View>
        </View>
      ) : (
        <>
          {/* Renderização do Mapa fixo no Android/iOS */}
          {MapView && Marker ? (
            <MapView
              style={styles.mapa}
              region={{
                latitude: LATITUDE_FIXA,
                longitude: LONGITUDE_FIXA,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              }}
              showsUserLocation={false}
              showsMyLocationButton={false}
              loadingEnabled={true}
            >
              <Marker
                coordinate={{
                  latitude: LATITUDE_FIXA,
                  longitude: LONGITUDE_FIXA,
                }}
                title="Base Leazor"
                description={ENDERECO_FIXO}
              />
            </MapView>
          ) : null}
        </>
      )}

      {/* Painel Inferior de Telemetria Fixo */}
      <View style={styles.painelTelemetria}>
        <Text style={styles.statusGps}>🟢 Posição </Text>
        <Text style={styles.coordenada}>Endereço: {ENDERECO_FIXO}</Text>
        <Text style={styles.coordenada}>Lat: {LATITUDE_FIXA}</Text>
        <Text style={styles.coordenada}>Long: {LONGITUDE_FIXA}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 16 },
  titulo: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  subtitulo: { color: '#AAAAAA', fontSize: 12, marginTop: 2 },
  badgeStatus: { backgroundColor: '#222222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 8, alignSelf: 'flex-start' },
  badgeText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  mapa: { flex: 1 },
  painelTelemetria: { padding: 16, backgroundColor: '#0D0D0D' },
  statusGps: { color: '#FFFFFF', fontSize: 13, marginBottom: 6, fontWeight: '500' },
  coordenada: { color: '#AAAAAA', fontSize: 12, marginTop: 2 },
  webContainer: { flex: 1, minHeight: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 24 },
  webTitulo: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  webTexto: { color: '#AAAAAA', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  webGpsCard: { width: '100%', maxWidth: 420, marginTop: 24, padding: 16, borderRadius: 10, backgroundColor: '#0D0D0D' },
});