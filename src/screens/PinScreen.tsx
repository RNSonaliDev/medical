import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  NativeModules,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Pin: { mode: 'setup' | 'unlock' };
  Home: undefined;
  Login: undefined;
};

// Only instantiate if the native module bridge exists
const hasBiometricsBridge = !!NativeModules.ReactNativeBiometrics;
const rnBiometrics = hasBiometricsBridge ? new ReactNativeBiometrics() : null;

export default function PinScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Pin'>>();
  const mode = route.params?.mode || 'unlock';

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Auto-focus native keyboard on mount
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(focusTimeout);
  }, []);

  // Check biometric availability safely
  useEffect(() => {
    if (rnBiometrics) {
      rnBiometrics.isSensorAvailable()
        .then((resultObject) => {
          const { available, biometryType } = resultObject;
          if (available && (biometryType === BiometryTypes.TouchID || biometryType === BiometryTypes.FaceID || biometryType === BiometryTypes.Biometrics)) {
            setIsBiometricsAvailable(true);
          }
        })
        .catch((error) => {
          console.log('Biometric sensor availability check failed: ', error);
        });
    }
  }, []);

  // Trigger biometric unlock immediately if in unlock mode
  const triggerBiometricUnlock = useCallback(async () => {
    if (!rnBiometrics) {
      return;
    }
    try {
      const isEnabled = await AsyncStorage.getItem('biometricsEnabled');
      if (isEnabled === 'true') {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Authenticate to access Patientist',
        });
        if (success) {
          navigation.replace('Home');
        }
      }
    } catch (error) {
      console.log('Biometric prompt failed: ', error);
    }
  }, [navigation]);

  useEffect(() => {
    if (mode === 'unlock') {
      triggerBiometricUnlock();
    }
  }, [mode, triggerBiometricUnlock]);

  const handleTextChange = (text: string) => {
    // Only allow numeric digits up to length 4
    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(cleanedText);

    if (cleanedText.length === 4) {
      // Debounce slightly to let the last dot fill in visually
      setTimeout(() => {
        handlePinComplete(cleanedText);
      }, 100);
    }
  };

  const handlePinComplete = async (completedPin: string) => {
    if (mode === 'setup') {
      if (step === 'create') {
        setConfirmPin(completedPin);
        setPin('');
        setStep('confirm');
        inputRef.current?.focus();
      } else {
        if (completedPin === confirmPin) {
          // PIN matches! Save to storage
          await AsyncStorage.setItem('userPin', completedPin);
          
          if (isBiometricsAvailable) {
            Alert.alert(
              'Enable Biometrics',
              'Would you like to enable Face ID / Fingerprint login for quicker access?',
              [
                {
                  text: 'No',
                  onPress: async () => {
                    await AsyncStorage.setItem('biometricsEnabled', 'false');
                    navigation.replace('Home');
                  },
                  style: 'cancel',
                },
                {
                  text: 'Yes',
                  onPress: async () => {
                    await AsyncStorage.setItem('biometricsEnabled', 'true');
                    navigation.replace('Home');
                  },
                },
              ]
            );
          } else {
            navigation.replace('Home');
          }
        } else {
          Alert.alert('Error', 'PINs do not match. Please try again.');
          setPin('');
          setStep('create');
          inputRef.current?.focus();
        }
      }
    } else {
      // Unlock Mode
      const storedPin = await AsyncStorage.getItem('userPin');
      if (completedPin === storedPin) {
        navigation.replace('Home');
      } else {
        Alert.alert('Error', 'Incorrect PIN code');
        setPin('');
        inputRef.current?.focus();
      }
    }
  };

  // Render Pin dots
  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < 4; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            pin.length > i ? styles.dotFilled : styles.dotEmpty,
          ]}
        />
      );
    }
    return dots;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Simple Brand Header */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <View style={styles.crossHorizontal} />
            <View style={styles.crossVertical} />
          </View>
          <Text style={styles.logoTextPurple}>P</Text>
          <Text style={styles.logoTextGreen}>atientist</Text>
        </View>

        <Text style={styles.heading}>
          {mode === 'setup'
            ? step === 'create'
              ? 'Create Secure PIN'
              : 'Confirm Your PIN'
            : 'Enter PIN to Unlock'}
        </Text>
        <Text style={styles.subHeading}>
          {mode === 'setup'
            ? 'Set a 4-digit PIN code to secure your account'
            : 'Provide your 4-digit security PIN to access the app'}
        </Text>
      </View>

      {/* Dots Display Container (Focuses keyboard on tap) */}
      <TouchableOpacity
        style={styles.dotsWrapper}
        onPress={() => inputRef.current?.focus()}
        activeOpacity={1}
      >
        <View style={styles.dotsContainer}>{renderDots()}</View>
      </TouchableOpacity>

      {/* Optional Biometric trigger link */}
      {mode === 'unlock' && isBiometricsAvailable && (
        <TouchableOpacity style={styles.biometricLink} onPress={triggerBiometricUnlock}>
          <Text style={styles.biometricLinkText}>Use Biometric Login</Text>
        </TouchableOpacity>
      )}

      {/* Hidden Text Input that captures native keyboard events */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={pin}
        onChangeText={handleTextChange}
        keyboardType="number-pad"
        maxLength={4}
        caretHidden={true}
        showSoftInputOnFocus={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 32,
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#d8b4fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  crossHorizontal: {
    width: 16,
    height: 5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    position: 'absolute',
  },
  crossVertical: {
    width: 5,
    height: 16,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    position: 'absolute',
  },
  logoTextPurple: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#a855f7',
  },
  logoTextGreen: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#84cc16',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  dotsWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  dotEmpty: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#a855f7',
  },
  biometricLink: {
    alignSelf: 'center',
    padding: 12,
  },
  biometricLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a855f7',
    textDecorationLine: 'underline',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
