import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { MapaRobo } from '../services/gpsService';
import { colors } from '../theme/theme';
 
export default function LocalizacaoScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <MapaRobo />
      </View>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
 
  container: {
    flex: 1,
  },
});
 