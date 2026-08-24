import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

// Mapeia o status real do dispositivo pra cor, usando a mesma lógica
// de equipamento de rodovia: cinza = parado, âmbar = em movimento,
// verde = executando a função (cortando), vermelho = alerta.
const STATUS_CONFIG = {
  PARADO: { label: 'Parado', color: colors.textSecondary },
  EM_MOVIMENTO: { label: 'Em movimento', color: colors.safety },
  EXECUTANDO_FUNCAO: { label: 'Cortando grama', color: colors.grass },
  ALERTA: { label: 'Alerta', color: colors.danger },
};

export default function StatusDispositivo({ status = 'PARADO' }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PARADO;

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { backgroundColor: config.color }]} />
      <View style={styles.textRow}>
        <View style={[styles.dot, { backgroundColor: config.color }]} />
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  bar: { height: 3, borderRadius: 2, marginBottom: 10 },
  textRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
});