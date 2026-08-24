import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/theme';

// disabled=true é pra sensores que já têm lugar reservado na tela
// mas ainda não existem fisicamente no robô (ex: temperatura por enquanto).
export default function SensorCard({
  icon,
  label,
  value,
  unit,
  disabled = false,
  disabledText = 'Em breve',
}) {
  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      <Ionicons
        name={icon}
        size={22}
        color={disabled ? colors.textDisabled : colors.grass}
        style={styles.icon}
      />
      {disabled ? (
        <Text style={styles.disabledText}>{disabledText}</Text>
      ) : (
        <Text style={typography.value}>
          {value ?? '—'}
          {value != null && unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
      )}
      <Text style={[typography.label, disabled && { color: colors.textDisabled }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardDisabled: {
    borderStyle: 'dashed',
    borderColor: colors.borderMuted,
    backgroundColor: 'transparent',
  },
  icon: { marginBottom: spacing.sm },
  unit: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
  disabledText: {
    fontSize: 13,
    color: colors.textDisabled,
    fontStyle: 'italic',
    marginBottom: 4,
  },
});
