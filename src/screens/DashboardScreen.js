import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import StatusDispositivo from '../components/StatusDispositivo';
import SensorCard from '../components/SensorCard';
import { colors, typography, spacing } from '../theme/theme';
import { ENDPOINTS } from '../services/api';

export default function DashboardScreen() {
  const [dadosSensores, setDadosSensores] = useState(null);

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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={typography.title}>Leazor</Text>
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