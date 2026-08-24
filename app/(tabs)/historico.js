import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusDispositivo from '../../src/components/StatusDispositivo';
import { colors, typography, spacing } from '../../src/theme/theme';

const HISTORICO_INICIAL = [
  { id: '1', tipo: 'ALERTA', titulo: 'Superaquecimento no motor', detalhe: 'Km 142 - Via Norte', data: '10:42' },
  { id: '2', tipo: 'CORTE', titulo: 'Trecho concluído (450m)', detalhe: 'Km 141 ao 141.5', data: '10:15' },
  { id: '3', tipo: 'ALERTA', titulo: 'Obstrução detectada nas lâminas', detalhe: 'Km 140', data: '09:30' },
  { id: '4', tipo: 'CORTE', titulo: 'Trecho concluído (1.2km)', detalhe: 'Km 138.8 ao 140', data: '08:50' },
];

export default function TabHistorico() {
  const [historico, setHistorico] = useState(HISTORICO_INICIAL);

  const removerItem = (id) => {
    setHistorico((prev) => prev.filter((item) => item.id !== id));
  };

  const limparTudo = () => {
    Alert.alert('Limpar Histórico', 'Deseja apagar todos os registros de operação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: () => setHistorico([]) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={typography.title}>Histórico de Operação</Text>
        <StatusDispositivo status="PARADO" />

        <View style={styles.headerAcoes}>
          <Text style={typography.label}>{historico.length} registros</Text>
          {historico.length > 0 && (
            <TouchableOpacity onPress={limparTudo}>
              <Text style={styles.btnLimparTudo}>Limpar Tudo</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.lista}>
          {historico.length === 0 ? (
            <View style={styles.vazioContainer}>
              <Ionicons name="archive-outline" size={48} color={colors.textDisabled} />
              <Text style={styles.vazioText}>Nenhum registro no histórico</Text>
            </View>
          ) : (
            historico.map((item) => (
              <View key={item.id} style={styles.card}>
                <Ionicons
                  name={item.tipo === 'ALERTA' ? 'warning-outline' : 'checkmark-circle-outline'}
                  size={24}
                  color={item.tipo === 'ALERTA' ? colors.danger : colors.grass}
                  style={styles.icon}
                />
                <View style={styles.info}>
                  <Text style={styles.cardTitulo}>{item.titulo}</Text>
                  <Text style={styles.cardDetalhe}>{item.detalhe}</Text>
                </View>
                <Text style={styles.cardData}>{item.data}</Text>
                <TouchableOpacity onPress={() => removerItem(item.id)} style={styles.btnDeletar}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.textDisabled} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.md },
  headerAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  btnLimparTudo: {
    ...typography.label,
    color: colors.danger,
    fontWeight: '700',
  },
  lista: { paddingBottom: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: { marginRight: spacing.sm },
  info: { flex: 1 },
  cardTitulo: { ...typography.body, fontSize: 14, fontWeight: '600' },
  cardDetalhe: { ...typography.label, fontSize: 12 },
  cardData: { ...typography.label, fontSize: 11, marginRight: spacing.sm },
  btnDeletar: { padding: 4 },
  vazioContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  vazioText: { ...typography.label, marginTop: spacing.sm },
});