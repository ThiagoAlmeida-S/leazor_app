import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusDispositivo from '../components/StatusDispositivo';
import SensorCard from '../components/SensorCard';
import { colors, typography, spacing } from '../theme/theme';
import { ENDPOINTS } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const [dadosSensores, setDadosSensores] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const buscarTelemetria = async () => {
      try {
        const resposta = await fetch(ENDPOINTS.TELEMETRIA);
        if (resposta.ok) {
          const dados = await resposta.json();
          setDadosSensores(dados);
        }
      } catch (error) {
        console.log("Aguardando backend Spring Boot ligar...");
      }
    };

    buscarTelemetria();
    const intervalo = setInterval(buscarTelemetria, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const confirmLogout = () => {
    setModalVisivel(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* CABEÇALHO COM BOTÃO DE LOGOUT */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={typography.title}>Leazor</Text>
            <Text style={styles.userLabel}>Operador: Admin</Text>
          </View>
          <TouchableOpacity
            style={styles.btnLogout}
            onPress={() => setModalVisivel(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.btnLogoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <StatusDispositivo status="PARADO" />

        <Text style={styles.sectionLabel}>Bateria</Text>
        <View style={styles.batteryCard}>
          <Text style={typography.value}>
            {dadosSensores?.bateria != null ? `${dadosSensores.bateria}%` : '—'}
          </Text>
          <Text style={typography.label}>
            {dadosSensores ? 'Leitura atualizada' : 'Aguardando leitura'}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Telemetria e Orientação</Text>
        <View style={styles.grid}>
          <SensorCard 
            icon="pulse-outline" 
            label="Distância" 
            value={dadosSensores?.distancia ?? null} 
            unit="cm" 
          />
          <SensorCard 
            icon="compass-outline" 
            label="Inclinação" 
            value={dadosSensores?.inclinacao ?? null} 
            unit="°" 
          />
          <SensorCard
            icon="thermometer-outline"
            label="Temperatura"
            value={dadosSensores?.temperatura ?? null}
            unit="°C"
          />
          <SensorCard
            icon="water-outline"
            label="Umidade"
            value={dadosSensores?.umidade ?? null}
            unit="%"
          />
        </View>

        {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
        <Modal
          visible={modalVisivel}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Ionicons name="log-out-outline" size={48} color={colors.danger} style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Encerrar Sessão</Text>
              <Text style={styles.modalMessage}>Deseja realmente sair da aplicação?</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.btnCancelar]}
                  onPress={() => setModalVisivel(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.btnConfirmar]}
                  onPress={confirmLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnConfirmarText}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userLabel: { ...typography.label, fontSize: 12, color: colors.textSecondary },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b1c1c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  btnLogoutText: { color: colors.danger, fontWeight: 'bold', fontSize: 13 },
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

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalIcon: { marginBottom: spacing.sm },
  modalTitle: { ...typography.title, fontSize: 18, marginBottom: 4 },
  modalMessage: { ...typography.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelar: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  btnCancelarText: { ...typography.body, fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  btnConfirmar: { backgroundColor: colors.danger },
  btnConfirmarText: { ...typography.body, fontSize: 14, color: '#fff', fontWeight: 'bold' },
});