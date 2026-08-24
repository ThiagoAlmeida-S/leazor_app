import { Redirect } from 'expo-router';

export default function Index() {
  // Redireciona a entrada do app direto para as abas
  return <Redirect href={"/(tabs)" as any} />;
}