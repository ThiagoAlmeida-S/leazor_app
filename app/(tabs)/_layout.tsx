import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/theme';
import { API_BASE_URL } from '../../src/services/api';
import LoginScreen from '../../src/screens/LoginScreen';
import { AuthContext } from '../../src/context/AuthContext';

export default function TabLayout() {
  const [isConectado, setIsConectado] = useState(false);
  const [isVerificando, setIsVerificando] = useState(true);
  const [isAutenticado, setIsAutenticado] = useState(false);

  const verificarConexao = async () => {
    setIsVerificando(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(API_BASE_URL, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      setIsConectado(true);
    } catch (error) {
      setIsConectado(false);
    } finally {
      setIsVerificando(false);
    }
  };

  useEffect(() => {
    verificarConexao();
  }, []);

  const logout = () => {
    setIsAutenticado(false);
  };

  if (isVerificando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.grass} />
        <Text style={styles.textLoading}>Conectando ao sistema...</Text>
      </View>
    );
  }

  if (!isConectado) {
    return (
      <View style={styles.container}>
        <Ionicons name="server-outline" size={80} color={colors.danger} />
        <Text style={styles.titleError}>Servidor Offline</Text>
        <Text style={styles.textError}>
          O aplicativo não conseguiu se comunicar com o backend.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={verificarConexao}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAutenticado) {
    return <LoginScreen onLoginSucesso={() => setIsAutenticado(true)} />;
  }

  return (
    <AuthContext.Provider value={{ logout }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarActiveTintColor: colors.grass,
          tabBarInactiveTintColor: colors.textSecondary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="controle"
          options={{
            title: 'Controle',
            tabBarIcon: ({ color }) => <Ionicons name="game-controller" size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="localizacao"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="historico"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
          }}
        />
      </Tabs>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  textLoading: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  },
  titleError: {
    color: colors.danger,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  textError: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  ipText: {
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#fff',
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.grass,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});