import { Platform } from 'react-native';

const WEB_API_URL = 'http://localhost:8080';
const MOBILE_API_URL = 'http://172.20.10.3:8080';

export const API_BASE_URL = Platform.OS === 'web' ? WEB_API_URL : MOBILE_API_URL;

// ⚡ SEU IP LOCAL DIRETO (Wi-Fi do Hotspot do seu celular)
export const RASPBERRY_IP = '172.20.10.2'; //100.94.182.54
export const RASPBERRY_URL = `http://${RASPBERRY_IP}:5000`;

export const ENDPOINTS = {
  // Endpoints de Histórico e Logs (Spring Boot Backend Java)
  HISTORICO: `${API_BASE_URL}/api/historico`,
  EMERGENCIA_LOG: `${API_BASE_URL}/api/comando/emergencia`,

  // Endpoints em Tempo Real (Comunicação Direta Local Sem Latência)
  COMANDO_RT: `${RASPBERRY_URL}/comando`,
  EMERGENCIA_RT: `${RASPBERRY_URL}/emergencia`,
  IA_DECISAO: `${RASPBERRY_URL}/ia_decisao`,
  IA_STATUS: `${RASPBERRY_URL}/ia_status`,
  TELEMETRIA_RT: `${RASPBERRY_URL}/telemetria`,
  GPS_RT: `${RASPBERRY_URL}/gps`,
  STREAM_IA: `${RASPBERRY_URL}/camera_ia`,
  STREAM_NORMAL: `${RASPBERRY_URL}/camera`,
};

export async function getTelemetriaHistorico() {
  const response = await fetch(`${API_BASE_URL}/api/telemetria`);

  if (!response.ok) {
    throw new Error('Falha ao buscar histórico de telemetria');
  }

  return response.json();
}