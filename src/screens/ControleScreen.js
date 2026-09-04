import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Joystick from '../components/Joystick';
import StatusDispositivo from '../components/StatusDispositivo';
import { colors, typography, spacing } from '../theme/theme';

// IP do Raspberry Pi na rede local
const RASPBERRY_IP = '172.20.10.4';
const CAMERA_URL = `http://${RASPBERRY_IP}:5000/camera`;
const COMANDO_URL = `http://${RASPBERRY_IP}:5000/comando`;

export default function ControleScreen() {
  const [cortando, setCortando] = useState(false);
  const [coordenadas, setCoordenadas] = useState({ x: 0, y: 0 });
  const [motores, setMotores] = useState({ esq: 0, dir: 0 });

  // Disparo dos comandos de movimentação para o Raspberry Pi
  const enviarComandoHTTP = async (velEsq, velDir) => {
    try {
      await fetch(COMANDO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comando: 'motores',
          esq: velEsq,
          dir: velDir,
        }),
      });
    } catch (error) {
      console.log('Erro ao conectar com o Raspberry Pi');
    }
  };

  // Alterna acionamento do motor de corte
  const handleToggleCorte = async () => {
    const novoEstado = !cortando;
    setCortando(novoEstado);

    try {
      await fetch(COMANDO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comando: 'corte',
          ativo: novoEstado,
        }),
      });
    } catch (error) {
      console.log('Erro ao enviar comando de corte');
    }
  };

  // Interrupção imediata de emergência
  const handleEmergencia = async () => {
    setCortando(false);
    setMotores({ esq: 0, dir: 0 });

    try {
      await fetch(COMANDO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comando: 'emergencia',
        }),
      });
    } catch (error) {
      console.log('Erro ao acionar emergência');
    }
  };

  // Algoritmo de Arcade Drive (Tração Diferencial)
  const calcularMotores = (x, y) => {
    let velEsq = y + x;
    let velDir = y - x;

    const max = Math.max(Math.abs(velEsq), Math.abs(velDir));
    if (max > 1.0) {
      velEsq /= max;
      velDir /= max;
    }

    return {
      esq: Math.round(velEsq * 100),
      dir: Math.round(velDir * 100),
    };
  };

  const handleJoystickMove = (data) => {
    setCoordenadas(data);
    
    const velocidades = calcularMotores(data.x, data.y);
    setMotores(velocidades);

    enviarComandoHTTP(velocidades.esq, velocidades.dir);
  };

  const cameraHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background-color: #000; }
          body, html { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; }
          img { width: 100%; height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${CAMERA_URL}" />
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <Text style={typography.title}>Operação Manual</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.dot, { backgroundColor: cortando ? colors.grass : colors.safety }]} />
            <Text style={styles.statusText}>
              {cortando ? 'LÂMINAS ATIVAS' : 'EM ESPERA'}
            </Text>
            <StatusDispositivo status={cortando ? 'EXECUTANDO_FUNCAO' : 'PARADO'} />
          </View>
        </View>

        {/* FEED DA CÂMERA (WEB E MOBILE) */}
        <View style={styles.cameraContainer}>
          {Platform.OS === 'web' ? (
            <img 
              src={CAMERA_URL} 
              alt="Feed de Vídeo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000000',
              }} 
            />
          ) : (
            <WebView
              source={{ html: cameraHtml }}
              style={styles.webview}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.cameraLoading}>
                  <ActivityIndicator size="large" color={colors.grass} />
                  <Text style={styles.cameraText}>Conectando à Câmera...</Text>
                </View>
              )}
            />
          )}
        </View>

        {/* PAINEL INFERIOR */}
        <View style={styles.painelInferior}>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.btnCorte, cortando && styles.btnCorteAtivo]} 
              onPress={handleToggleCorte}
              activeOpacity={0.8}
            >
              <Ionicons name="power-outline" size={28} color={colors.textPrimary} />
              <Text style={styles.btnText}>{cortando ? 'PARAR CORTE' : 'INICIAR CORTE'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnEmergencia} 
              onPress={handleEmergencia}
              activeOpacity={0.8}
            >
              <Ionicons name="alert-circle" size={32} color={colors.textPrimary} />
              <Text style={styles.btnText}>EMERGÊNCIA</Text>
            </TouchableOpacity>
          </View>

          {/* JOYSTICK INTERATIVO */}
          <View style={styles.joystickWrapper}>
            <Joystick size={180} knobSize={70} onMove={handleJoystickMove} />
            
            {/* Monitor de Debug dos Motores */}
            <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <Text style={{ ...typography.label, fontSize: 11 }}>COORDENADAS BRUTAS</Text>
              <Text style={{ ...typography.body, fontSize: 12, marginBottom: 8 }}>
                X: {coordenadas.x.toFixed(2)} | Y: {coordenadas.y.toFixed(2)}
              </Text>
              
              <Text style={{ ...typography.label, fontSize: 11, color: colors.safety }}>VELOCIDADE ESTEIRAS</Text>
              <Text style={{ ...typography.body, fontSize: 13, color: colors.safety, fontWeight: 'bold' }}>
                Esq: {motores.esq}% | Dir: {motores.dir}%
              </Text>
            </View>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { ...typography.label, fontSize: 11, color: colors.textPrimary, marginRight: 8 },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: { ...typography.label, marginTop: spacing.sm, color: colors.textDisabled },
  painelInferior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionButtons: { flex: 1, marginRight: spacing.md, justifyContent: 'space-between', height: 180 },
  btnCorte: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.grass,
    borderRadius: 14,
    padding: spacing.sm,
    alignItems: 'center',
    flex: 1,
    marginBottom: spacing.sm,
    justifyContent: 'center',
  },
  btnCorteAtivo: { backgroundColor: colors.grassMuted, borderColor: colors.grass },
  btnEmergencia: {
    backgroundColor: colors.danger,
    borderRadius: 14,
    padding: spacing.sm,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  btnText: { ...typography.eyebrow, color: colors.textPrimary, marginTop: 4, fontSize: 10, textAlign: 'center' },
  joystickWrapper: { alignItems: 'center', justifyContent: 'center' },
});