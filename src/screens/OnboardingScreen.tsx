import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';

interface OnboardingScreenProps {
  onSkip: () => void;
  onUpgrade: (plan: 'free' | 'pro') => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onSkip,
  onUpgrade,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');

  const features = [
    {
      icon: '✨',
      text: 'Unlimited AI-powered mockup generation',
    },
    {
      icon: '🎨',
      text: 'High-resolution export for all designs',
    },
    {
      icon: '⚡',
      text: 'Priority processing and faster generation',
    },
    {
      icon: '🔒',
      text: 'Early access to new product types and features',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Main Visual */}
        <View style={styles.visualContainer}>
          <View style={styles.glowCircle} />
          <Text style={styles.visualIcon}>🎨</Text>
        </View>

        {/* Product Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>MerchAI</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Free</Text>
          </View>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          AI-powered merchandise mockups: Create professional product designs in
          seconds.
        </Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ))}
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingContainer}>
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedPlan === 'free' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('free')}>
            <Text style={styles.pricingTitle}>MerchAI</Text>
            <View style={styles.pricingAmount}>
              <Text style={styles.strikethrough}>$19</Text>
              <Text style={styles.freeText}> Free</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pricingCard,
              styles.pricingCardRight,
              selectedPlan === 'pro' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('pro')}>
            <Text style={styles.pricingTitle}>MerchAI Pro</Text>
            <Text style={styles.proPrice}>$29/mo</Text>
          </TouchableOpacity>
        </View>

        {/* Trial Information */}
        <Text style={styles.trialText}>
          7 day free trial • Renews at $29/month. Cancel anytime.
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => onUpgrade(selectedPlan)}>
          <Text style={styles.ctaButtonText}>
            {selectedPlan === 'free'
              ? 'Start with MerchAI for Free'
              : 'Upgrade to MerchAI Pro'}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}>|</Text>
          <TouchableOpacity>
            <Text style={styles.footerText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}>|</Text>
          <TouchableOpacity>
            <Text style={styles.footerText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  skipButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 20,
  },
  skipText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    marginVertical: 20,
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#3b82f6',
    opacity: 0.2,
    blur: 40,
  },
  visualIcon: {
    fontSize: 80,
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  checkmark: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: 'bold',
  },
  pricingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pricingCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    marginRight: 6,
  },
  pricingCardRight: {
    marginRight: 0,
    marginLeft: 6,
  },
  pricingCardSelected: {
    borderColor: '#ffffff',
    backgroundColor: '#0f172a',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  pricingAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikethrough: {
    fontSize: 16,
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  freeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
  },
  proPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  trialText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaButtonText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
  },
  footerSeparator: {
    fontSize: 11,
    color: '#475569',
    marginHorizontal: 8,
  },
});

export default OnboardingScreen;

