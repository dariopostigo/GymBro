/**
 * GymBro
 * Hello World template for a gym / fitness React Native app.
 *
 * @format
 */

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const FEATURES = [
  { title: 'Rutinas', description: 'Crea y sigue tus planes de entrenamiento' },
  { title: 'Progreso', description: 'Registra pesos, repeticiones y series' },
  { title: 'Estadísticas', description: 'Visualiza tu evolución en el tiempo' },
];

function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.hero}>
          <Text style={styles.logo}>GYMBRO</Text>
          <Text style={styles.tagline}>Hello, Gym World!</Text>
          <Text style={styles.subtitle}>
            Tu compañero de entrenamiento, siempre contigo.
          </Text>
        </View>

        <View style={styles.cardList}>
          {FEATURES.map(feature => (
            <View key={feature.title} style={styles.card}>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const colors = {
  background: '#111417',
  surface: '#1c2227',
  accent: '#ff5a1f',
  text: '#f5f6f7',
  muted: '#9aa3ab',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    color: colors.accent,
  },
  tagline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 8,
  },
  cardList: {
    paddingHorizontal: 24,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
});

export default App;
