import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/theme';

export default function LoginScreen({ onLoginSucesso }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const handleEntrar = () => {
    setMensagemErro('');

    const uLimpo = usuario.trim().toLowerCase();
    const sLimpa = senha.trim();

    if (uLimpo === 'admin' && sLimpa === '1234') {
      onLoginSucesso();
    } else {
      const msg = 'Usuário ou senha incorretos.';
      setMensagemErro(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Acesso Negado', msg);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="shield-checkmark-outline" size={64} color={colors.grass} style={styles.icon} />
        <Text style={typography.title}>Leazor Access</Text>
        <Text style={styles.subtitle}>Digite as credenciais da equipe</Text>

        {mensagemErro !== '' && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{mensagemErro}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={colors.textDisabled} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Usuário"
            placeholderTextColor={colors.textDisabled}
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textDisabled} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.textDisabled}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity style={styles.btnEntrar} onPress={handleEntrar} activeOpacity={0.8}>
          <Text style={styles.btnText}>ENTRAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  icon: { marginBottom: spacing.md },
  subtitle: { ...typography.label, marginBottom: spacing.xl },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b1c1c',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    width: '100%',
    gap: 8,
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
    height: 50,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, color: colors.textPrimary, ...typography.body },
  btnEntrar: {
    backgroundColor: colors.grass,
    borderRadius: 12,
    height: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  btnText: { ...typography.eyebrow, color: colors.background, fontWeight: 'bold' },
});