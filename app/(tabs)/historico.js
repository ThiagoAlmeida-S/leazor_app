import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusDispositivo from '../../src/components/StatusDispositivo';
import { colors, typography, spacing } from '../../src/theme/theme';
import { ENDPOINTS } from '../../src/services/api';

export default function TabHistorico() {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarHistorico = async () => {
    try {
      const resposta = await fetch(ENDPOINTS.HISTORICO);
      if (resposta.ok) {
        const dados = await resposta.json();
        setHistorico(dados);
      }
    } catch (error) {
      console.log('Aguardando backend Spring Boot para carregar histórico...');
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarHistorico();
  };

  const removerItem = (id) => {
    setHistorico((prev) => prev.filter((item) => item.id !== id));
  };

  const limparTudo = () => {
    Alert.alert('Limpar Histórico', 'Deseja apagar os registros da tela?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: () => setHistorico([]) },
    ]);
  };

  const formatarHora = (dataIso) => {
    if (!dataIso) return '--:--';
    const data = new Date(dataIso);
    return isNaN(data.getTime())
      ? dataIso
      : data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

        {carregando ? (
          <View style={styles.vazioContainer}>
            <ActivityIndicator size="large" color={colors.grass} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.lista}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.grass} />
            }
          >
            {historico.length === 0 ? (
              <View style={styles.vazioContainer}>
                <Ionicons name="archive-outline" size={48} color={colors.textDisabled} />
                <Text style={styles.vazioText}>Nenhum registro no histórico</Text>
              </View>
            ) : (
              historico.map((item, index) => {
                const isAlerta = item.tipo === 'ALERTA' || item.tipoAlert === 'CRITICO';
                const titulo = item.titulo || item.descricao || item.mensagem || 'Evento de operação';
                const detalhe = item.detalhe || (item.sensor ? `Sensor: ${item.sensor.nome}` : 'Registro do sistema');
                const hora = item.data ? item.data : formatarHora(item.dataHora);

                return (
                  <View key={item.id ? item.id.toString() : index.toString()} style={styles.card}>
                    <Ionicons
                      name={isAlerta ? 'warning-outline' : 'checkmark-circle-outline'}
                      size={24}
                      color={isAlerta ? colors.danger : colors.grass}
                      style={styles.icon}
                    />
                    <View style={styles.info}>
                      <Text style={styles.cardTitulo}>{titulo}</Text>
                      <Text style={styles.cardDetalhe}>{detalhe}</Text>
                    </View>
                    <Text style={styles.cardData}>{hora}</Text>
                    <TouchableOpacity onPress={() => removerItem(item.id)} style={styles.btnDeletar}>
                      <Ionicons name="close-circle-outline" size={20} color={colors.textDisabled} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
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