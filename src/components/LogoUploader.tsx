import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {launchImageLibrary, ImagePickerResponse} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {ImageUploadSchema, validateAndSanitize} from '../utils/validation';

interface LogoUploaderProps {
  onUpload: (base64: string) => void;
  currentLogo: string | null;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({onUpload, currentLogo}) => {
  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      selectionLimit: 1,
      presentationStyle: 'pageSheet' as const,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      // Handle cancellation (back button pressed)
      if (response.didCancel || response.errorCode === 'camera_unavailable') {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        
        // Validate file size (10MB limit)
        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          Alert.alert('Error', 'Image too large. Maximum size is 10MB.');
          return;
        }

        // Validate MIME type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (asset.type && !allowedTypes.includes(asset.type)) {
          Alert.alert('Error', 'Invalid image type. Please use PNG or JPEG.');
          return;
        }
        
        if (asset.base64) {
          // Validate image data
          const validation = validateAndSanitize(ImageUploadSchema, {
            base64: asset.base64,
            mimeType: (asset.type || 'image/png') as 'image/png' | 'image/jpeg' | 'image/jpg',
          });

          if (!validation.success) {
            Alert.alert('Error', validation.error);
            return;
          }

          // Use base64 directly if available
          const base64String = `data:${asset.type || 'image/png'};base64,${asset.base64}`;
          onUpload(base64String);
        } else if (asset.uri) {
          // Read file and convert to base64
          try {
            const base64 = await RNFS.readFile(asset.uri, 'base64');
            const base64String = `data:${asset.type || 'image/png'};base64,${base64}`;
            onUpload(base64String);
          } catch (error) {
            Alert.alert('Error', 'Failed to read image file');
          }
        }
      }
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleImagePicker}
      activeOpacity={0.7}>
      {currentLogo ? (
        <View style={styles.previewContainer}>
          <Image source={{uri: currentLogo}} style={styles.previewImage} />
          <Text style={styles.changeText}>Tap to change logo</Text>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <Text style={styles.uploadIcon}>📤</Text>
          <Text style={styles.uploadTitle}>Upload your logo</Text>
          <Text style={styles.uploadSubtitle}>
            PNG or SVG with transparency works best
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#475569',
    borderRadius: 12,
    backgroundColor: '#1e293b',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
  },
  changeText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 12,
  },
  uploadContainer: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LogoUploader;

