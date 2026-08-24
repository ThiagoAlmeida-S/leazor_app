import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import StatusDispositivo from '../components/StatusDispositivo';
import SensorCard from '../components/SensorCard';
import { colors, typography, spacing } from '../theme/theme';

// Nenhum dado real conectado ainda de propósito. Quando o endpoint
// GET /api/telemetria estiver pronto, isso vira useState + useEffect.
export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={typography.title}>Leazor</Text>
        <StatusDispositivo status="PARADO" />

        <Text style={styles.sectionLabel}>Bateria</Text>
        <View style={styles.batteryCard}>
          <Text style={typography.value}>—</Text>
          <Text style={typography.label}>Aguardando leitura</Text>
        </View>

        <Text style={styles.sectionLabel}>Sensores</Text>
        <View style={styles.grid}>
          <SensorCard icon="pulse-outline" label="Distância (ultrassônico)" value={null} unit="cm" />
          <SensorCard
            icon="thermometer-outline"
            label="Temperatura"
            disabled
            disabledText="Sensor a instalar"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  sectionLabel: {
    ...typography.eyebrow,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  batteryCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});