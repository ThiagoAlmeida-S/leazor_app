import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/theme';

// O mapa de verdade (react-native-maps) entra numa próxima iteração,
// quando já tivermos coordenadas reais chegando do GPS.
export default function LocalizacaoScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={typography.title}>Localização</Text>
        <Text style={styles.subtitle}>Posição do robô via GPS</Text>

        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={32} color={colors.textDisabled} />
          <Text style={styles.mapText}>Mapa será integrado aqui</Text>
        </View>

        <View style={styles.coordCard}>
          <Ionicons name="location-outline" size={18} color={colors.grass} />
          <Text style={styles.coordText}>Aguardando coordenadas do GPS</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg },
  subtitle: { ...typography.label, marginBottom: spacing.lg },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  mapText: { ...typography.label, marginTop: spacing.sm },
  coordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  coordText: { ...typography.body, marginLeft: spacing.sm },
});