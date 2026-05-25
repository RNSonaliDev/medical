/**
 * Medical App - React Navigation Setup
 */

import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStorage as AsyncStorage } from './src/utils/storage';
import LoginScreen from './src/screens/LoginScreen';
import PinScreen from './src/screens/PinScreen';

// Define routing types
type RootStackParamList = {
  Login: undefined;
  Pin: { mode: 'setup' | 'unlock' };
  Home: undefined;
  Details: { serviceName: string; description: string };
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

// Sleek Card Component for the dashboard
interface DashboardCardProps {
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, subtitle, color, onPress }) => (
  <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={[styles.badge, { backgroundColor: color + '15' }]}>
        <Text style={[styles.badgeText, { color: color }]}>Active</Text>
      </View>
    </View>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
    <Text style={styles.actionText}>Access Service →</Text>
  </TouchableOpacity>
);

function HomeScreen({ navigation }: HomeScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hello, Welcome Back</Text>
        <Text style={styles.appName}>Careflow Medical</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        
        <DashboardCard
          title="Telehealth Consultation"
          subtitle="Speak with certified specialists within 10 minutes."
          color="#3b82f6"
          onPress={() => navigation.navigate('Details', {
            serviceName: 'Telehealth Consultation',
            description: 'Get instant virtual medical consultation from the comfort of your home. Consult top doctors across multiple specialties 24/7.'
          })}
        />

        <DashboardCard
          title="Laboratory Reports"
          subtitle="View and download clinical test results securely."
          color="#10b981"
          onPress={() => navigation.navigate('Details', {
            serviceName: 'Laboratory Reports',
            description: 'Access clinical lab test reports online. View full diagnostic details, tracking changes in key metrics over time with interactive visualization.'
          })}
        />

        <DashboardCard
          title="Prescription Refills"
          subtitle="Order recurring prescriptions directly to your door."
          color="#8b5cf6"
          onPress={() => navigation.navigate('Details', {
            serviceName: 'Prescription Refills',
            description: 'Direct prescription renewal request to your primary physician. Track delivery or pickup schedule from your local preferred pharmacy.'
          })}
        />
      </View>
    </ScrollView>
  );
}

function DetailsScreen({ route }: DetailsScreenProps) {
  const { serviceName, description } = route.params;

  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>{serviceName}</Text>
      </View>
      <View style={styles.detailsContent}>
        <Text style={styles.detailsDesc}>{description}</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.buttonText}>Book/Request Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = React.useState(true);
  const [initialMode, setInitialMode] = React.useState<'setup' | 'unlock'>('unlock');

  React.useEffect(() => {
    const checkPin = async () => {
      try {
        const storedPin = await AsyncStorage.getItem('userPin');
        if (storedPin) {
          setInitialMode('unlock');
        } else {
          setInitialMode('setup');
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkPin();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, isDarkMode && styles.loaderContainerDark]}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Pin"
          screenOptions={{
            headerStyle: {
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            },
            headerTintColor: isDarkMode ? '#f8fafc' : '#0f172a',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
            }
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Pin" 
            component={PinScreen} 
            options={{ headerShown: false }}
            initialParams={{ mode: initialMode }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Careflow' }}
          />
          <Stack.Screen 
            name="Details" 
            component={DetailsScreen} 
            options={({ route }) => ({ title: route.params.serviceName })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loaderContainerDark: {
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 24,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  detailsContainer: {
    flex: 1,
    padding: 24,
  },
  detailsHeader: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  detailsContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  detailsDesc: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
