import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import {postMockupExport} from '../services/apiService';
import {sanitizeString} from '../utils/validation';

interface EditorProps {
  imageUrl: string;
  onEdit: (prompt: string) => void;
  isEditing: boolean;
  onExport: () => void;
  mockupId?: string | null;
  userId?: string;
}

const Editor: React.FC<EditorProps> = ({
  imageUrl,
  onEdit,
  isEditing,
  onExport,
  mockupId,
  userId,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim()) {
      // Sanitize input before sending
      const sanitizedPrompt = sanitizeString(prompt);
      if (sanitizedPrompt.length < 1) {
        Alert.alert('Error', 'Please enter a valid edit instruction');
        return;
      }
      if (sanitizedPrompt.length > 500) {
        Alert.alert('Error', 'Edit instruction is too long (max 500 characters)');
        return;
      }
      onEdit(sanitizedPrompt);
      setPrompt('');
    }
  };

  const quickPrompts = [
    'Add a retro vintage filter',
    'Change the product color to navy blue',
    'Make the background a modern office',
    'Add dramatic sunset lighting',
    'Place in a mountain scenery',
  ];

  const handleExport = async () => {
    try {
      // Extract base64 from data URL
      const base64Data = imageUrl.includes(',')
        ? imageUrl.split(',')[1]
        : imageUrl;

      // Create filename
      const timestamp = Date.now();
      const filename = `merch-mockup-${timestamp}.png`;
      
      // Save to device
      const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
      await RNFS.writeFile(path, base64Data, 'base64');

      Alert.alert(
        'Success',
        `Image saved to: ${path}`,
        [{text: 'OK'}]
      );

      // Store export data in MongoDB
      if (userId && mockupId) {
        await postMockupExport({
          userId,
          mockupId,
          exportTimestamp: Date.now(),
          exportPath: path,
        });
      }

      onExport();
    } catch (error) {
      Alert.alert('Error', 'Failed to export image');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {isEditing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>
              AI is remastering your mockup...
            </Text>
          </View>
        )}
        <Image 
          source={{uri: imageUrl}} 
          style={styles.image} 
          resizeMode="contain"
          onError={(error) => {
            console.error('Image load error:', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('Image loaded successfully');
          }}
        />
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          disabled={isEditing}>
          <Text style={styles.exportButtonText}>💾 Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickPromptsContainer}
          contentContainerStyle={styles.quickPromptsContent}>
          {quickPrompts.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onEdit(p)}
              style={styles.quickPromptButton}
              disabled={isEditing}>
              <Text style={styles.quickPromptText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={prompt}
            onChangeText={(text) => {
              // Sanitize on input change
              const sanitized = sanitizeString(text);
              if (sanitized.length <= 500) {
                setPrompt(sanitized);
              }
            }}
            placeholder="Type instructions to edit (e.g. 'Add a retro filter')"
            placeholderTextColor="#64748b"
            editable={!isEditing}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.applyButton, (!prompt.trim() || isEditing) && styles.applyButtonDisabled]}
            onPress={handleSubmit}
            disabled={isEditing || !prompt.trim()}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  imageContainer: {
    minHeight: 300,
    maxHeight: 500,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 60,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    minHeight: 300,
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsContainer: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    padding: 16,
  },
  quickPromptsContainer: {
    marginBottom: 12,
  },
  quickPromptsContent: {
    paddingRight: 8,
  },
  quickPromptButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  quickPromptText: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  inputWrapper: {
    marginTop: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#e2e8f0',
    fontSize: 14,
    minHeight: 44,
    maxHeight: 200,
  },
  applyButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  applyButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.5,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  exportButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Editor;

