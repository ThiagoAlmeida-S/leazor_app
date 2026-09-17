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
      } else {
        console.log('Erro ao buscar histórico do Spring Boot:', resposta.status);
      }
    } catch (error) {
      console.log('Aguardando conexão com o servidor Spring Boot...');
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
    // Atualiza a cada 3 segundos para mostrar novos eventos da IA em tempo real
    const intervalo = setInterval(carregarHistorico, 3000);
    return () => clearInterval(intervalo);
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
      : data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const obterIconeECor = (tipoEvento) => {
    switch (tipoEvento) {
      case 'OBSTACULO_DETECTADO':
        return { icone: 'warning-outline', cor: colors.danger };
      case 'GRAMA_ALTA':
        return { icone: 'leaf-outline', cor: colors.grass };
      case 'EMERGENCIA':
        return { icone: 'alert-circle-outline', cor: colors.danger };
      default:
        return { icone: 'information-circle-outline', cor: colors.textSecondary };
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={typography.title}>Histórico de Operação</Text>
        <StatusDispositivo status="PARADO" />

        <View style={styles.headerAcoes}>
          <Text style={typography.label}>{historico.length} eventos registrados</Text>
          {historico.length > 0 && (
            <TouchableOpacity onPress={limparTudo}>
              <Text style={styles.btnLimparTudo}>Limpar Exibição</Text>
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
                <Text style={styles.vazioText}>Nenhum evento gravado no banco de dados</Text>
              </View>
            ) : (
              historico.map((item, index) => {
                const tipo = item.tipoEvento || 'INFO';
                const titulo = item.tipoEvento ? item.tipoEvento.replace('_', ' ') : 'Evento de Operação';
                const detalhe = item.descricao || 'Registro do sistema';
                const hora = formatarHora(item.dataHora);
                const { icone, cor } = obterIconeECor(tipo);

                return (
                  <View key={item.id ? item.id.toString() : index.toString()} style={styles.card}>
                    <Ionicons name={icone} size={24} color={cor} style={styles.icon} />
                    <View style={styles.info}>
                      <Text style={[styles.cardTitulo, { color: cor }]}>{titulo}</Text>
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
  cardTitulo: { ...typography.body, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  cardDetalhe: { ...typography.label, fontSize: 12, color: colors.textPrimary, marginTop: 2 },
  cardData: { ...typography.label, fontSize: 11, marginRight: spacing.sm, color: colors.textSecondary },
  btnDeletar: { padding: 4 },
  vazioContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  vazioText: { ...typography.label, marginTop: spacing.sm },
});