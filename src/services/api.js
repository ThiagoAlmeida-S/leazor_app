// Digite aqui o IP da sua máquina onde o Spring Boot está rodando
export const API_BASE_URL = 'http://192.168.100.147:8080';

export const ENDPOINTS = {
  COMANDO: `${API_BASE_URL}/api/comando`,
  TELEMETRIA: `${API_BASE_URL}/api/telemetria`,
  HISTORICO: `${API_BASE_URL}/api/historico`,
  EMERGENCIA: `${API_BASE_URL}/api/emergencia`,
};