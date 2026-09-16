import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
 
const RASPBERRY_IP = '100.94.182.54';
const GPS_URL = `http://${RASPBERRY_IP}:5000/gps`;
 
type GPSData = {
  lat?: number;
  lon?: number;
  latitude?: number;
  longitude?: number;
  fix?: boolean;
  sats?: number;
  satellites?: number;
};
 
declare global {
  interface Window {
    L: any;
  }
}
 
function carregarLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('O mapa só pode ser carregado no navegador.'));
      return;
    }
 
    // Se o Leaflet já estiver carregado
    if (window.L) {
      resolve(window.L);
      return;
    }
 
    // Carregar o CSS do Leaflet
    let css = document.getElementById(
      'leaflet-css'
    ) as HTMLLinkElement | null;
 
    if (!css) {
      css = document.createElement('link');
      css.id = 'leaflet-css';
      css.rel = 'stylesheet';
      css.href =
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
 
      document.head.appendChild(css);
    }
 
    // Verificar se o script já foi criado
    let script = document.getElementById(
      'leaflet-js'
    ) as HTMLScriptElement | null;
 
    if (script) {
      script.addEventListener('load', () => {
        if (window.L) {
          resolve(window.L);
        } else {
          reject(new Error('Leaflet não encontrado.'));
        }
      });
 
      return;
    }
 
    // Carregar o JavaScript do Leaflet
    script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src =
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
 
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error('Leaflet não foi carregado.'));
      }
    };
 
    script.onerror = () => {
      reject(new Error('Erro ao carregar o JavaScript do Leaflet.'));
    };
 
    document.body.appendChild(script);
  });
}
 
export function MapaRobo() {
  const mapaDivRef = useRef<HTMLDivElement | null>(null);
  const mapaRef = useRef<any>(null);
  const marcadorRef = useRef<any>(null);
 
  const [gps, setGps] = useState<GPSData | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [leafletPronto, setLeafletPronto] = useState(false);
 
  const latitudeInicial = -23.528028;
  const longitudeInicial = -46.827695;
 
  /*
   * Carrega o Leaflet
   */
  useEffect(() => {
    let ativo = true;
 
    carregarLeaflet()
      .then(() => {
        if (ativo) {
          setLeafletPronto(true);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar mapa:', error);
 
        if (ativo) {
          setErro('Não foi possível carregar o mapa.');
        }
      });
 
    return () => {
      ativo = false;
    };
  }, []);
 
  /*
   * Cria o mapa depois que o Leaflet estiver pronto
   */
  useEffect(() => {
    if (
      !leafletPronto ||
      !mapaDivRef.current ||
      mapaRef.current
    ) {
      return;
    }
 
    const L = window.L;
 
    try {
      const mapa = L.map(mapaDivRef.current).setView(
        [latitudeInicial, longitudeInicial],
        17
      );
 
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; OpenStreetMap contributors',
          maxZoom: 21,
        }
      ).addTo(mapa);
 
      const iconeRobo = L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
 
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
 
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
 
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
 
      marcadorRef.current = L.marker(
        [latitudeInicial, longitudeInicial],
        {
          icon: iconeRobo,
        }
      )
        .addTo(mapa)
        .bindPopup('🌱 LEAZOR');
 
      mapaRef.current = mapa;
 
      // Corrige o tamanho do mapa depois de renderizado
      setTimeout(() => {
        if (mapaRef.current) {
          mapaRef.current.invalidateSize();
        }
      }, 500);
    } catch (error) {
      console.error('Erro ao criar o mapa:', error);
      setErro('Erro ao criar o mapa.');
    }
 
    return () => {
      if (mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current = null;
      }
    };
  }, [leafletPronto]);
 
  /*
   * Busca a localização do Raspberry Pi
   */
  useEffect(() => {
    let ativo = true;
 
    async function buscarGPS() {
      try {
        const resposta = await fetch(GPS_URL);
 
        if (!resposta.ok) {
          throw new Error(`Erro HTTP ${resposta.status}`);
        }
 
        const dados: GPSData = await resposta.json();
 
        if (!ativo) {
          return;
        }
 
        setGps(dados);
        setErro(null);
 
        const lat = Number(
          dados.lat ?? dados.latitude
        );
 
        const lon = Number(
          dados.lon ?? dados.longitude
        );
 
        if (
          mapaRef.current &&
          marcadorRef.current &&
          Number.isFinite(lat) &&
          Number.isFinite(lon)
        ) {
          marcadorRef.current.setLatLng([lat, lon]);
 
          mapaRef.current.setView(
            [lat, lon],
            17
          );
        }
      } catch (error) {
        console.error('Erro ao buscar GPS:', error);
 
        if (ativo) {
          setErro('GPS aguardando conexão...');
        }
      }
    }
 
    buscarGPS();
 
    const intervalo = setInterval(
      buscarGPS,
      3000
    );
 
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);
 
  const latitude = gps?.lat ?? gps?.latitude;
  const longitude = gps?.lon ?? gps?.longitude;
  const satelites = gps?.sats ?? gps?.satellites;
 
  return (
    <View style={styles.container}>
      <div
        ref={mapaDivRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 500,
        }}
      />
 
      <View style={styles.painel}>
        <Text style={styles.titulo}>
          🌱 LEAZOR - Localização
        </Text>
 
        {gps ? (
          <>
            <Text style={styles.texto}>
              Latitude: {latitude ?? '---'}
            </Text>
 
            <Text style={styles.texto}>
              Longitude: {longitude ?? '---'}
            </Text>
 
            <Text style={styles.texto}>
              Satélites: {satelites ?? '---'}
            </Text>
 
            <Text style={styles.status}>
              GPS: {gps.fix ? 'Conectado' : 'Aguardando fix'}
            </Text>
          </>
        ) : (
          <Text style={styles.texto}>
            Aguardando dados do GPS...
          </Text>
        )}
 
        {erro && (
          <Text style={styles.erro}>
            {erro}
          </Text>
        )}
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 500,
    position: 'relative',
    backgroundColor: '#e5e5e5',
  },
 
  painel: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    elevation: 5,
  },
 
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1d1d1d',
  },
 
  texto: {
    fontSize: 14,
    color: '#222',
    marginTop: 3,
  },
 
  status: {
    fontSize: 14,
    color: '#16803c',
    fontWeight: 'bold',
    marginTop: 6,
  },
 
  erro: {
    color: '#b00020',
    fontSize: 13,
    marginTop: 6,
  },
});
 