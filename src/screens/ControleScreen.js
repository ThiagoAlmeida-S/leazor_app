import React, { useState, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Slider from '@react-native-community/slider';
import Joystick from '../components/Joystick';
import StatusDispositivo from '../components/StatusDispositivo';
import { colors, typography, spacing } from '../theme/theme';
import { ENDPOINTS } from '../services/api';

// Componente da Câmera isolado com React.memo para evitar re-renders na Thread do JS
const FeedCamera = memo(({ urlCameraAtual }) => {
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
        <img src="${urlCameraAtual}" />
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    return (
      <img
        src={urlCameraAtual}
        alt="Feed de Vídeo"
        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
      />
    );
  }

  return (
    <WebView
      source={{ html: cameraHtml }}
      style={styles.webview}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.cameraLoading}>
          <ActivityIndicator size="large" color={colors.grass} />
          <Text style={styles.cameraText}>Conectando ao Feed da Câmera...</Text>
        </View>
      )}
    />
  );
});

export default function ControleScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = Platform.OS !== 'web' && width > height;

  const [cortando, setCortando] = useState(false);
  const [motores, setMotores] = useState({ esq: 0, dir: 0 });
  const [emergenciaAtiva, setEmergenciaAtiva] = useState(false);
  const [velocidadeMax, setVelocidadeMax] = useState(255);
  const [cameraAtiva, setCameraAtiva] = useState('IA');
  const [decisaoIA, setDecisaoIA] = useState(false);
  const [autocorteIA, setAutocorteIA] = useState(false);

  // Referência para cancelar requisições HTTP antigas acumuladas na fila
  const abortControllerRef = useRef(null);
  const ultimoEnvioRef = useRef(0);

  const urlCameraAtual = cameraAtiva === 'IA' ? ENDPOINTS.STREAM_IA : ENDPOINTS.STREAM_NORMAL;

  // Envio Ultra-Rápido sem acúmulo na fila de rede
  const enviarComandoMotores = async (velEsq, velDir) => {
    const agora = Date.now();
    const ehComandoParar = velEsq === 0 && velDir === 0;

    // Se houver uma requisição em andamento, cancela imediatamente para dar lugar à nova
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Se NÃO for comando de parar, limita o envio a cada 60ms (Throttling)
    if (!ehComandoParar && agora - ultimoEnvioRef.current < 60) {
      return;
    }
    ultimoEnvioRef.current = agora;

    // Cria um novo controller de cancelamento para esta requisição
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await fetch(ENDPOINTS.COMANDO_RT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
        signal: controller.signal,
        body: JSON.stringify({
          comando: 'motores',
          esq: velEsq,
          dir: velDir,
        }),
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Erro no envio direto dos motores');
      }
    }
  };

  const handleToggleCorte = async () => {
    const novoEstado = !cortando;
    setCortando(novoEstado);

    try {
      await fetch(ENDPOINTS.COMANDO_RT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comando: 'corte',
          ativo: novoEstado,
        }),
      });
    } catch (error) {
      console.log('Erro no comando do corte');
    }
  };

  const handleToggleDecisaoIA = async () => {
    const novoEstado = !decisaoIA;
    setDecisaoIA(novoEstado);

    try {
      await fetch(ENDPOINTS.IA_DECISAO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ativo: novoEstado,
          autocorte: autocorteIA,
          navegacao: false,
        }),
      });
    } catch (error) {
      console.log('Erro ao alterar IA');
    }
  };

  const handleToggleAutocorteIA = async () => {
    const novoEstado = !autocorteIA;
    setAutocorteIA(novoEstado);

    try {
      await fetch(ENDPOINTS.IA_DECISAO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ativo: decisaoIA,
          autocorte: novoEstado,
          navegacao: false,
        }),
      });
    } catch (error) {
      console.log('Erro ao alterar autocorte');
    }
  };

  const handleAlternarEmergencia = async () => {
    const novaAcao = emergenciaAtiva ? 'liberar' : 'ativar';

    if (novaAcao === 'ativar') {
      setCortando(false);
      setMotores({ esq: 0, dir: 0 });
      setEmergenciaAtiva(true);
    } else {
      setEmergenciaAtiva(false);
    }

    try {
      await fetch(ENDPOINTS.EMERGENCIA_RT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: novaAcao }),
      });
    } catch (error) {
      console.log('Erro no botão de emergência');
    }
  };

  // Cálculo da cinemática
  const calcularMotores = useCallback((x, y) => {
    let velEsq = y + x;
    let velDir = y - x;

    const max = Math.max(Math.abs(velEsq), Math.abs(velDir));
    if (max > 1.0) {
      velEsq /= max;
      velDir /= max;
    }

    // Inversão para compensar ESP32 V9
    return {
      esq: Math.round(velDir * velocidadeMax),
      dir: Math.round(velEsq * velocidadeMax),
    };
  }, [velocidadeMax]);

  const handleJoystickMove = useCallback((data) => {
    const velocidades = calcularMotores(data.x, data.y);
    setMotores(velocidades);
    enviarComandoMotores(velocidades.esq, velocidades.dir);
  }, [calcularMotores]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isLandscape && styles.containerLandscape]}>
        <View style={[styles.header, isLandscape && styles.headerLandscape]}>
          <Text style={[typography.title, isLandscape && { fontSize: 16 }]}>Operação Manual</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: emergenciaAtiva
                    ? colors.danger
                    : cortando
                    ? colors.grass
                    : colors.safety,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {emergenciaAtiva
                ? 'EMERGÊNCIA ATIVA'
                : cortando
                ? 'LÂMINAS ATIVAS'
                : 'EM ESPERA'}
            </Text>
            <StatusDispositivo status={emergenciaAtiva ? 'PARADO' : cortando ? 'EXECUTANDO_FUNCAO' : 'PARADO'} />
          </View>
        </View>

        <View style={[styles.conteudo, isLandscape && styles.conteudoLandscape]}>
          <View style={[styles.secaoCamera, isLandscape && styles.secaoCameraLandscape]}>
            <View style={styles.cameraSelector}>
              <TouchableOpacity
                style={[styles.selectorBtn, cameraAtiva === 'IA' && styles.selectorBtnAtivo]}
                onPress={() => setCameraAtiva('IA')}
                activeOpacity={0.8}
              >
                <Ionicons name="hardware-chip-outline" size={16} color={cameraAtiva === 'IA' ? colors.textPrimary : colors.textDisabled} />
                <Text style={[styles.selectorText, cameraAtiva === 'IA' && styles.selectorTextAtivo]}>CÂMERA IA</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.selectorBtn, cameraAtiva === 'NORMAL' && styles.selectorBtnAtivo]}
                onPress={() => setCameraAtiva('NORMAL')}
                activeOpacity={0.8}
              >
                <Ionicons name="videocam-outline" size={16} color={cameraAtiva === 'NORMAL' ? colors.textPrimary : colors.textDisabled} />
                <Text style={[styles.selectorText, cameraAtiva === 'NORMAL' && styles.selectorTextAtivo]}>CÂMERA VISUAL</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.cameraContainer, isLandscape && styles.cameraContainerLandscape]}>
              <FeedCamera urlCameraAtual={urlCameraAtual} />
            </View>
          </View>

          <View style={[styles.painelInferior, isLandscape && styles.painelLandscape]}>
            <View style={[styles.actionButtons, isLandscape && styles.actionButtonsLandscape]}>
              <TouchableOpacity
                style={[styles.btnAction, decisaoIA && styles.btnIAAtivo]}
                onPress={handleToggleDecisaoIA}
                activeOpacity={0.8}
              >
                <Ionicons name={decisaoIA ? 'hardware-chip' : 'hardware-chip-outline'} size={18} color={colors.textPrimary} />
                <Text style={styles.btnText}>{decisaoIA ? 'DECISÃO IA: ON' : 'DECISÃO IA: OFF'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAction, autocorteIA && styles.btnAutocorteAtivo]}
                onPress={handleToggleAutocorteIA}
                activeOpacity={0.8}
              >
                <Ionicons name={autocorteIA ? 'cut' : 'cut-outline'} size={18} color={colors.textPrimary} />
                <Text style={styles.btnText}>{autocorteIA ? 'AUTOCORTE: ON' : 'AUTOCORTE: OFF'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAction, styles.btnCorte, cortando && styles.btnCorteAtivo]}
                onPress={handleToggleCorte}
                activeOpacity={0.8}
              >
                <Ionicons name="power-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.btnText}>{cortando ? 'PARAR CORTE' : 'INICIAR CORTE'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnAction,
                  emergenciaAtiva ? styles.btnDesbloquear : styles.btnEmergencia,
                ]}
                onPress={handleAlternarEmergencia}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={emergenciaAtiva ? 'lock-open-outline' : 'alert-circle'}
                  size={20}
                  color={colors.textPrimary}
                />
                <Text style={styles.btnText}>
                  {emergenciaAtiva ? 'DESBLOQUEAR' : 'EMERGÊNCIA'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.joystickWrapper, isLandscape && styles.joystickWrapperLandscape]}>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sliderLabel}>POTÊNCIA MÁXIMA (PWM)</Text>
                  <Text style={styles.sliderValue}>{Math.round((velocidadeMax / 255) * 100)}% ({velocidadeMax})</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={50}
                  maximumValue={255}
                  step={5}
                  value={velocidadeMax}
                  onValueChange={setVelocidadeMax}
                  minimumTrackTintColor={colors.grass}
                  maximumTrackTintColor={colors.surfaceAlt}
                  thumbTintColor={colors.grass}
                />
              </View>

              <Joystick size={isLandscape ? 130 : 160} knobSize={isLandscape ? 50 : 60} onMove={handleJoystickMove} />

              <View style={{ marginTop: spacing.xs, alignItems: 'center' }}>
                <Text style={{ ...typography.label, fontSize: 9, color: colors.safety }}>VELOCIDADE MOTORES (PWM)</Text>
                <Text style={{ ...typography.body, fontSize: 11, color: colors.safety, fontWeight: 'bold' }}>
                  Esq: {motores.esq} PWM | Dir: {motores.dir} PWM
                </Text>
              </View>
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
  containerLandscape: { padding: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  headerLandscape: { marginBottom: spacing.xs },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { ...typography.label, fontSize: 11, color: colors.textPrimary, marginRight: 8 },
  conteudo: { flex: 1 },
  conteudoLandscape: { flexDirection: 'row', gap: spacing.md },
  secaoCamera: { flex: 1 },
  secaoCameraLandscape: { flex: 1.6 },
  cameraSelector: { flexDirection: 'row', marginBottom: spacing.xs, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 3 },
  selectorBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
  selectorBtnAtivo: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  selectorText: { ...typography.label, fontSize: 11, color: colors.textDisabled },
  selectorTextAtivo: { color: colors.textPrimary, fontWeight: 'bold' },
  cameraContainer: { flex: 1, backgroundColor: '#000', borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.md },
  cameraContainerLandscape: { marginBottom: 0 },
  webview: { flex: 1, backgroundColor: '#000' },
  cameraLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  cameraText: { ...typography.label, marginTop: spacing.sm, color: colors.textDisabled },
  painelInferior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  painelLandscape: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  actionButtons: { flex: 1, marginRight: spacing.md, justifyContent: 'space-between', gap: 6 },
  actionButtonsLandscape: { marginRight: spacing.xs, gap: 4 },
  btnAction: { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  btnIAAtivo: { backgroundColor: colors.surface, borderColor: colors.grass },
  btnAutocorteAtivo: { backgroundColor: colors.surface, borderColor: colors.grass },
  btnCorte: { borderColor: colors.grass },
  btnCorteAtivo: { backgroundColor: colors.grassMuted, borderColor: colors.grass },
  btnEmergencia: { backgroundColor: colors.danger, borderColor: colors.danger },
  btnDesbloquear: { backgroundColor: '#d97706', borderColor: '#f59e0b' },
  btnText: { ...typography.eyebrow, color: colors.textPrimary, fontSize: 9, textAlign: 'center' },
  joystickWrapper: { alignItems: 'center', justifyContent: 'center' },
  joystickWrapperLandscape: { paddingLeft: spacing.xs },
  sliderContainer: { width: 170, marginBottom: 8, backgroundColor: colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  sliderLabel: { ...typography.label, fontSize: 9, color: colors.textSecondary },
  sliderValue: { ...typography.label, fontSize: 10, color: colors.grass, fontWeight: 'bold' },
  slider: { width: '100%', height: 24 },
});