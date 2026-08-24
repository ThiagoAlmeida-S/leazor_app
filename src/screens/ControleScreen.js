import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Joystick from '../components/Joystick';
import { colors, typography, spacing } from '../theme/theme';

export default function ControleScreen() {
  const [cortando, setCortando] = useState(false);
  const [coordenadas, setCoordenadas] = useState({ x: 0, y: 0 });
  const [motores, setMotores] = useState({ esq: 0, dir: 0 });

  // Algoritmo de Arcade Drive (Tração Diferencial)
  const calcularMotores = (x, y) => {
    let velEsq = y + x;
    let velDir = y - x;

    // Se o valor passar de 1.0 ou -1.0, dividimos ambos pelo maior valor
    // para manter a proporção da curva sem estourar o limite do motor
    const max = Math.max(Math.abs(velEsq), Math.abs(velDir));
    if (max > 1.0) {
      velEsq /= max;
      velDir /= max;
    }

    // Retorna em formato de porcentagem (-100 a 100)
    return {
      esq: Math.round(velEsq * 100),
      dir: Math.round(velDir * 100)
    };
  };

  const handleJoystickMove = (data) => {
    setCoordenadas(data);
    
    const velocidades = calcularMotores(data.x, data.y);
    setMotores(velocidades);

    // Aqui no futuro chamaremos o endpoint HTTP com o objeto 'velocidades'
  };

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
          </View>
        </View>

        {/* FEED DA CÂMERA */}
        <View style={styles.cameraContainer}>
          <Ionicons name="videocam-outline" size={40} color={colors.textDisabled} />
          <Text style={styles.cameraText}>Feed de Vídeo (Desconectado)</Text>
        </View>

        {/* PAINEL INFERIOR */}
        <View style={styles.painelInferior}>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.btnCorte, cortando && styles.btnCorteAtivo]} 
              onPress={() => setCortando(!cortando)}
              activeOpacity={0.8}
            >
              <Ionicons name="power-outline" size={28} color={colors.textPrimary} />
              <Text style={styles.btnText}>{cortando ? 'PARAR CORTE' : 'INICIAR CORTE'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnEmergencia} 
              onPress={() => console.warn('EMERGÊNCIA!')}
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
  statusText: { ...typography.label, fontSize: 11, color: colors.textPrimary },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  cameraText: { ...typography.label, marginTop: spacing.sm },
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
  btnText: { ...typography.eyebrow, color: colors.textPrimary, marginTop: 4, fontSize: 10 },
  joystickWrapper: { alignItems: 'center', justifyContent: 'center' },
  joystickLabel: { ...typography.label, marginTop: spacing.xs, fontSize: 11 },
});