import { Platform } from 'react-native';

const WEB_API_URL = 'http://localhost:8080';
const MOBILE_API_URL = 'http://172.20.10.2:8080';

export const API_BASE_URL = Platform.OS === 'web' ? WEB_API_URL : MOBILE_API_URL;

export const RASPBERRY_IP = '100.94.182.54'; // ip que está conectado o RPI 100.94.182.54
export const RASPBERRY_URL = `http://${RASPBERRY_IP}:5000`;

export const ENDPOINTS = {
  HISTORICO: `${API_BASE_URL}/api/historico`,
  EMERGENCIA: `${API_BASE_URL}/api/emergencia`,
  
  COMANDO_RT: `${RASPBERRY_URL}/comando`,
  TELEMETRIA_RT: `${RASPBERRY_URL}/telemetria`,
  GPS_RT: `${RASPBERRY_URL}/gps`,
};

export async function getTelemetriaHistorico() {
  const response = await fetch(`${API_BASE_URL}/api/telemetria`);

  if (!response.ok) {
    throw new Error('Falha ao buscar histórico de telemetria');
  }

  return response.json();
}