/**
 * LoginScreen - Authentication screen with Google and Apple Sign-In
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthCredentialState,
} from '@invertase/react-native-apple-authentication';
import {GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID} from '../config/env';

interface LoginScreenProps {
  onLoginSuccess: (user: {id: string; email: string; name: string; provider: 'google' | 'apple'}) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({onLoginSuccess}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      // Force code for the refresh token
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoadingProvider('google');
      setIsLoading(true);

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Sign in
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.user) {
        const user = userInfo.data.user;
        onLoginSuccess({
          id: user.id || '',
          email: user.email || '',
          name: user.name || user.givenName || 'User',
          provider: 'google',
        });
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.log('Something went wrong:', error.toString());
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoadingProvider('apple');
      setIsLoading(true);

      // Check if Apple Sign-In is available
      const isAvailable = await appleAuth.isSupported();
      if (!isAvailable) {
        console.log('Apple Sign-In is not available on this device');
        setIsLoading(false);
        setLoadingProvider(null);
        return;
      }

      // Request Apple Sign-In
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
      });

      // Check credential state
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );

      if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
        // User is authenticated
        const email = appleAuthRequestResponse.email || '';
        const fullName = appleAuthRequestResponse.fullName;
        const name = fullName
          ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
          : 'User';

        onLoginSuccess({
          id: appleAuthRequestResponse.user,
          email: email,
          name: name || 'Apple User',
          provider: 'apple',
        });
      }
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      if (error.code === appleAuth.Error.CANCELED) {
        console.log('User cancelled Apple Sign-In');
      } else {
        console.log('Apple Sign-In error:', error.toString());
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🎨</Text>
          <Text style={styles.appTitle}>MerchAI</Text>
          <Text style={styles.tagline}>Create professional merchandise mockups</Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              styles.googleButton,
              isLoading && loadingProvider !== 'google' && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}>
            {isLoading && loadingProvider === 'google' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <View style={styles.buttonIcon}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.buttonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign-In Button (iOS only) */}
          {Platform.OS === 'ios' && (
            <AppleButton
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={AppleButton.Type.SIGN_IN}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: '#ffffff',
  },
  appleButtonAndroid: {
    backgroundColor: '#000000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  appleIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  appleButtonText: {
    color: '#ffffff',
  },
  appleButton: {
    width: '100%',
    height: 56,
    marginTop: 0,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;

