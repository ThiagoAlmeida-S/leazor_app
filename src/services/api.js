import { Platform } from 'react-native';

// URL usada quando o aplicativo roda no navegador do mesmo computador
const WEB_API_URL = 'http://localhost:8080';

// IP do computador onde o Spring Boot está rodando
// O celular precisa estar conectado à mesma rede Wi-Fi do computador.
const MOBILE_API_URL = 'http://192.168.0.44:8080';

// No navegador usa localhost; no celular usa o IP do computador.
export const API_BASE_URL =
  Platform.OS === 'web'
    ? WEB_API_URL
    : MOBILE_API_URL;

export async function getTelemetria() {
  const response = await fetch(`${API_BASE_URL}/api/telemetria`);

  if (!response.ok) {
    throw new Error('Falha ao buscar telemetria');
  }

  return response.json();
}

export const ENDPOINTS = {
  COMANDO: `${API_BASE_URL}/api/comando`,
  TELEMETRIA: `${API_BASE_URL}/api/telemetria`,
  HISTORICO: `${API_BASE_URL}/api/historico`,
  EMERGENCIA: `${API_BASE_URL}/api/emergencia`,
};