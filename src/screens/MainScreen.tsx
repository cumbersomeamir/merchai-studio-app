/**
 * MainScreen - The main app interface for creating merchandise mockups
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {AppState, ProductType, MockupResult} from '../types';
import LogoUploader from '../components/LogoUploader';
import ProductSelector from '../components/ProductSelector';
import Editor from '../components/Editor';

interface MainScreenProps {
  state: AppState;
  currentViewId: string | null;
  userId?: string;
  onLogoUpload: (logo: string) => void;
  onProductSelect: (product: ProductType) => void;
  onGenerate: () => void;
  onEdit: (prompt: string) => void;
  onExport: () => void;
  onResultSelect: (id: string) => void;
}

const MainScreen: React.FC<MainScreenProps> = ({
  state,
  currentViewId,
  userId,
  onLogoUpload,
  onProductSelect,
  onGenerate,
  onEdit,
  onExport,
  onResultSelect,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const activeMockup = state.results.find(r => r.id === currentViewId);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#020617' : '#f8fafc'}
      />
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>✨</Text>
            </View>
            <Text style={styles.appTitle}>MerchAI</Text>
          </View>

          <View style={styles.sidebarContent}>
            <View style={styles.section}>
              <LogoUploader
                onUpload={onLogoUpload}
                currentLogo={state.logo}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Product</Text>
              <ProductSelector
                onSelect={onProductSelect}
                selectedId={state.selectedProduct?.id}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.generateButton,
                (!state.logo ||
                  !state.selectedProduct ||
                  state.isGenerating) &&
                  styles.generateButtonDisabled,
              ]}
              onPress={onGenerate}
              disabled={
                !state.logo || !state.selectedProduct || state.isGenerating
              }>
              {state.isGenerating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.generateButtonText}>Generate Mockup</Text>
              )}
            </TouchableOpacity>

            {state.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{state.error}</Text>
                {(global as any).lastApiResponse && (
                  <ScrollView style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>Full API Response:</Text>
                    <Text style={styles.responseText}>
                      {(global as any).lastApiResponse}
                    </Text>
                  </ScrollView>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Recent Work</Text>
              {state.results.length === 0 ? (
                <Text style={styles.emptyText}>No mockups yet</Text>
              ) : (
                <View style={styles.resultsList}>
                  {state.results.map(res => (
                    <TouchableOpacity
                      key={res.id}
                      style={[
                        styles.resultItem,
                        currentViewId === res.id && styles.resultItemActive,
                      ]}
                      onPress={() => onResultSelect(res.id)}>
                      <View style={styles.resultThumbnail}>
                        <Text style={styles.resultThumbnailText}>🖼️</Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultProductName}>
                          {res.productType}
                        </Text>
                        <Text style={styles.resultTimestamp}>
                          {new Date(res.timestamp).toLocaleTimeString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.mainHeader}>
            <View>
              <Text style={styles.mainTitle}>Preview & Editor</Text>
              <Text style={styles.mainSubtitle}>
                Design and iterate your merchandise in real-time.
              </Text>
            </View>
          </View>

          <View style={styles.editorContainer}>
            {activeMockup ? (
              <Editor
                imageUrl={activeMockup.url}
                onEdit={onEdit}
                isEditing={state.isGenerating}
                onExport={onExport}
                mockupId={activeMockup.id}
                userId={userId}
              />
            ) : (
              <View style={styles.emptyState}>
                {state.isGenerating ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>
                      Generating your first mockup...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyStateContent}>
                    <Text style={styles.emptyStateIcon}>🎨</Text>
                    <Text style={styles.emptyStateTitle}>Ready to Design?</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Upload a logo and choose a product to start generating
                      your custom merchandise shots.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
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
  containerDark: {
    backgroundColor: '#020617',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  sidebar: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  sidebarContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748b',
    marginBottom: 8,
  },
  generateButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  generateButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#991b1b',
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginBottom: 8,
  },
  responseContainer: {
    maxHeight: 200,
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  responseLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  responseText: {
    color: '#cbd5e1',
    fontSize: 8,
    fontFamily: 'monospace',
  },
  resultsList: {
    marginTop: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#1e293b',
  },
  resultItemActive: {
    borderColor: '#2563eb',
    backgroundColor: '#1e3a8a',
  },
  resultThumbnail: {
    width: 48,
    height: 48,
    backgroundColor: '#334155',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultThumbnailText: {
    fontSize: 20,
  },
  resultInfo: {
    flex: 1,
  },
  resultProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  resultTimestamp: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 8,
  },
  mainContent: {
    flex: 1,
    padding: 16,
    minHeight: 300,
  },
  mainHeader: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  editorContainer: {
    minHeight: 600,
  },
  emptyState: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#1e293b',
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 300,
    padding: 24,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default MainScreen;

