import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
  Login: undefined;
  Pin: { mode: 'setup' | 'unlock' };
  Home: undefined;
};

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const handleLogin = () => {
    if (email.trim() && password.trim()) {
      navigation.replace('Pin', { mode: 'setup' });
    } else {
      Alert.alert('Error', 'Please enter your email and password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: Math.max(insets.bottom, 24) }]} keyboardShouldPersistTaps="handled">
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <View style={styles.crossHorizontal} />
              <View style={styles.crossVertical} />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTextPurple}>P</Text>
              <Text style={styles.logoTextGreen}>atientist</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Welcome to Patientist</Text>
            <Text style={styles.subHeading}>
              Welcome Back, Please enter your login credentials and login
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder=""
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Password Field */}
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'password' && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeButton}
              >
                {/* Custom Vector Eye representation */}
                <View style={styles.eyeIconOuter}>
                  <View style={styles.eyeIconPupil} />
                  {!isPasswordVisible && <View style={styles.eyeIconSlash} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don’t have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.signupLinkText}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Language Selector */}
          <View style={styles.languageContainer}>
            <View style={styles.speechBubbleIcon}>
              <View style={styles.bubbleMain} />
              <View style={styles.bubbleTail} />
              <Text style={styles.bubbleText}>A</Text>
            </View>
            <Text style={styles.languageLabel}>Language : </Text>
            <TouchableOpacity style={styles.languageDropdown}>
              <Text style={styles.languageValue}>English</Text>
              <View style={styles.downArrow} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#d8b4fe', // Purple container
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  crossHorizontal: {
    width: 20,
    height: 6,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    position: 'absolute',
  },
  crossVertical: {
    width: 6,
    height: 20,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    position: 'absolute',
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextPurple: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#a855f7', // Purple P
  },
  logoTextGreen: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#84cc16', // Green atientist
  },
  headingContainer: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155', // Dark charcoal text
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 26,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  inputWrapperFocused: {
    borderColor: '#d8b4fe',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#334155',
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIconOuter: {
    width: 20,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconPupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
  },
  eyeIconSlash: {
    width: 20,
    height: 1.5,
    backgroundColor: '#334155',
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#a855f7',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#d8b4fe', // Soft purple background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#334155',
    fontSize: 14,
  },
  signupLinkText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: 'bold',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  speechBubbleIcon: {
    width: 22,
    height: 18,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleMain: {
    width: 18,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#64748b',
    borderRadius: 3,
    position: 'absolute',
  },
  bubbleTail: {
    width: 4,
    height: 4,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#64748b',
    position: 'absolute',
    bottom: 0,
    left: 2,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
  },
  bubbleText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
  },
  languageLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  languageDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageValue: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
  },
  downArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#a855f7',
    marginLeft: 6,
    marginTop: 2,
  },
});
