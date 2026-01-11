/**
 * MerchAI Studio - React Native App
 * App for creating merchandise mockups using AI
 */

import React, {useState, useCallback, useEffect} from 'react';
import {Alert, Platform} from 'react-native';
import {AppState, ProductType, MockupResult} from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainScreen from './src/screens/MainScreen';
import {generateMockup, editMockup} from './src/services/geminiService';
import {connectToMongoDB} from './src/services/mongodbService';
import {
  postLoginData,
  postOnboardingData,
  postMockupGeneration,
  postMockupEdit,
  postMockupExport,
} from './src/services/apiService';
import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
} from './src/utils/secureStorage';
import {storeTokens, getCurrentUserId} from './src/utils/auth';

const ONBOARDING_KEY = '@merchai_onboarding_completed';
const LOGIN_KEY = '@merchai_user_logged_in';
const USER_DATA_KEY = '@merchai_user_data';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<{
    id: string;
    email: string;
    name: string;
    provider: 'google' | 'apple';
  } | null>(null);
  const [state, setState] = useState<AppState>({
    logo: null,
    selectedProduct: null,
    results: [],
    isGenerating: false,
    error: null,
  });

  const [currentViewId, setCurrentViewId] = useState<string | null>(null);

  // Initialize MongoDB connection
  useEffect(() => {
    const initMongoDB = async () => {
      try {
        await connectToMongoDB();
      } catch (error) {
        console.error('MongoDB initialization error:', error);
        // Continue app flow even if MongoDB fails
      }
    };
    initMongoDB();
  }, []);

  // Check if user is logged in and onboarding status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use secure storage for sensitive data
        const loggedIn = await getSecureItem(LOGIN_KEY);
        const userDataStr = await getSecureItem(USER_DATA_KEY);
        const onboardingCompleted = await getSecureItem(ONBOARDING_KEY);

        if (loggedIn === 'true' && userDataStr) {
          setIsLoggedIn(true);
          setUserData(JSON.parse(userDataStr));
          setShowOnboarding(onboardingCompleted === null);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLoginSuccess = useCallback(async (user: {
    id: string;
    email: string;
    name: string;
    provider: 'google' | 'apple';
  }) => {
    try {
      // Store in secure storage
      await setSecureItem(LOGIN_KEY, 'true');
      await setSecureItem(USER_DATA_KEY, JSON.stringify(user));
      
      // Store tokens securely (generate mock tokens for now - in production, get from auth provider)
      await storeTokens({
        accessToken: `mock_access_${user.id}_${Date.now()}`, // In production, get real token
        refreshToken: `mock_refresh_${user.id}_${Date.now()}`, // In production, get real token
        expiresIn: 3600, // 1 hour
        userId: user.id,
      });
      
      setUserData(user);
      setIsLoggedIn(true);
      
      // Store login data in MongoDB
      await postLoginData({
        userId: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        loginTimestamp: Date.now(),
        deviceInfo: {
          platform: Platform.OS,
          osVersion: Platform.Version.toString(),
        },
      });
      
      // Check onboarding status after login
      const onboardingCompleted = await getSecureItem(ONBOARDING_KEY);
      setShowOnboarding(onboardingCompleted === null);
    } catch (error) {
      console.error('Error saving login status:', error);
      Alert.alert('Error', 'Failed to save login information');
    }
  }, []);

  const handleOnboardingComplete = useCallback(async (plan: 'free' | 'pro') => {
    try {
      await setSecureItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
      
      // Store onboarding data in MongoDB
      if (userData) {
        await postOnboardingData({
          userId: userData.id,
          selectedPlan: plan,
          skipped: false,
          timestamp: Date.now(),
          trialInfo: {
            started: plan === 'pro',
            startDate: plan === 'pro' ? Date.now() : undefined,
          },
        });
      }
      
      if (plan === 'pro') {
        // Handle pro upgrade logic here
        Alert.alert('Welcome to MerchAI Pro!', 'Your subscription is active.');
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  }, [userData]);

  const handleOnboardingSkip = useCallback(async () => {
    try {
      await setSecureItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
      
      // Store onboarding skip data in MongoDB
      if (userData) {
        await postOnboardingData({
          userId: userData.id,
          selectedPlan: 'free',
          skipped: true,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  }, [userData]);

  const handleLogoUpload = useCallback((logo: string) => {
    setState(prev => ({...prev, logo}));
  }, []);

  const handleProductSelect = useCallback((product: ProductType) => {
    setState(prev => ({...prev, selectedProduct: product}));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!state.logo || !state.selectedProduct) {
      Alert.alert('Missing Information', 'Please upload a logo and select a product');
      return;
    }

    setState(prev => ({...prev, isGenerating: true, error: null}));

    try {
      const imageUrl = await generateMockup(
        state.logo,
        state.selectedProduct.promptHint
      );
      const newResult: MockupResult = {
        id: Math.random().toString(36).substring(2, 9),
        url: imageUrl,
        timestamp: Date.now(),
        prompt: state.selectedProduct.promptHint,
        productType: state.selectedProduct.name,
      };

      setState(prev => ({
        ...prev,
        results: [newResult, ...prev.results],
        isGenerating: false,
      }));
      setCurrentViewId(newResult.id);

      // Store mockup generation data in MongoDB
      if (userData && state.selectedProduct) {
        await postMockupGeneration({
          userId: userData.id,
          mockupId: newResult.id,
          productType: newResult.productType,
          productId: state.selectedProduct.id,
          promptHint: newResult.prompt,
          timestamp: newResult.timestamp,
          logoUploaded: !!state.logo,
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to generate mockup';
      
      // If error contains full response, extract and display it
      let displayError = errorMessage;
      if (errorMessage.includes('NO_IMAGE_IN_RESPONSE:')) {
        const responseData = errorMessage.split('NO_IMAGE_IN_RESPONSE:')[1];
        console.log('=== FULL RESPONSE FROM ERROR ===');
        console.log(responseData);
        console.log('=== END RESPONSE ===');
        displayError = `No image in response. Full API response logged to console and shown below:\n\n${responseData.substring(0, 500)}...`;
        // Store full response for user to see
        (global as any).lastApiResponse = responseData;
      }
      
      setState(prev => ({
        ...prev,
        error: displayError,
        isGenerating: false,
      }));
      Alert.alert('Error', displayError.substring(0, 500));
    }
  }, [state.logo, state.selectedProduct]);

  const handleEdit = useCallback(
    async (prompt: string) => {
      if (!currentViewId) return;
      const currentResult = state.results.find(r => r.id === currentViewId);
      if (!currentResult) return;

      setState(prev => ({...prev, isGenerating: true}));

      try {
        const newImageUrl = await editMockup(currentResult.url, prompt);
        const updatedResults = state.results.map(r =>
          r.id === currentViewId
            ? {...r, url: newImageUrl, timestamp: Date.now()}
            : r
        );

        setState(prev => ({
          ...prev,
          results: updatedResults,
          isGenerating: false,
        }));

        // Store mockup edit data in MongoDB
        if (userData && currentViewId) {
          await postMockupEdit({
            userId: userData.id,
            mockupId: currentViewId,
            editPrompt: prompt,
            timestamp: Date.now(),
            isRegeneration: false,
          });
        }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to edit mockup';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isGenerating: false,
      }));
      Alert.alert('Error', errorMessage);
      }
    },
    [currentViewId, state.results]
  );

  const handleExport = useCallback(() => {
    // Export is handled in Editor component
  }, []);

  const handleResultSelect = useCallback((id: string) => {
    setCurrentViewId(id);
  }, []);

  // Show loading state while checking auth
  if (isLoggedIn === null) {
    return null; // Loading state
  }

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Show onboarding on first launch after login
  if (showOnboarding === null) {
    return null; // Loading state
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onSkip={handleOnboardingSkip}
        onUpgrade={handleOnboardingComplete}
      />
    );
  }

  // Show main app
  return (
    <MainScreen
      state={state}
      currentViewId={currentViewId}
      userId={userData?.id}
      onLogoUpload={handleLogoUpload}
      onProductSelect={handleProductSelect}
      onGenerate={handleGenerate}
      onEdit={handleEdit}
      onExport={handleExport}
      onResultSelect={handleResultSelect}
    />
  );
};

export default App;
