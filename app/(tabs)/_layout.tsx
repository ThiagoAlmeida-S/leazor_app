import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/theme';

export default function TabLayout() {
  return (
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
        tabBarActiveTintColor: colors.grass, // Verde quando selecionado
        tabBarInactiveTintColor: colors.textSecondary, // Cinza quando inativo
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
  );
}