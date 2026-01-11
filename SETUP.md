# Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure API Key

The API key is already set in the `.env` file. If you need to change it:

1. Get your Gemini API key from: https://aistudio.google.com/app/apikey
2. Edit the `.env` file in the root directory:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. **Important**: After changing `.env`, rebuild the app (not just restart Metro):
   - Android: `npm run android` (will rebuild)
   - iOS: Rebuild in Xcode or run `npm run ios`

## 3. iOS Setup

### Install CocoaPods
```bash
cd ios
pod install
cd ..
```

### Add Permissions to Info.plist
The app needs photo library access. Add these keys to `ios/MerchaiStudio/Info.plist`:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to upload logos</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need access to save generated images</string>
```

## 4. Android Setup

### Add Permissions to AndroidManifest.xml
Add these permissions to `android/app/src/main/AndroidManifest.xml` (inside `<manifest>` tag):

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

For Android 13+ (API 33+), also add:
```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

## 5. Link Native Modules

The following packages require native linking:
- `react-native-image-picker`
- `react-native-fs`
- `react-native-permissions`

After installing, you may need to:
- Run `npx react-native link` (if using older RN versions)
- Or ensure auto-linking is working (RN 0.60+)

## 6. Run the App

```bash
# Start Metro
npm start

# Run on Android (in another terminal)
npm run android

# Run on iOS (in another terminal)
npm run ios
```

## Testing the App

1. **Upload Logo**: Tap the upload area, select an image from your gallery
2. **Select Product**: Choose a product type (T-Shirt, Hoodie, etc.)
3. **Generate**: Tap "Generate Mockup" - wait for AI to create the image
4. **Edit**: Try editing with prompts like "Add a retro filter" or "Change background to beach"
5. **Export**: Save your mockup to device storage

## Troubleshooting

### API Key Issues
- Make sure the API key is set in `src/config/env.ts`
- Verify the key is valid at https://aistudio.google.com/app/apikey
- Check API quota/limits

### Image Picker Not Working
- Verify permissions are added to AndroidManifest.xml and Info.plist
- Check that react-native-image-picker is properly linked
- Try rebuilding the app after adding permissions

### Build Errors
- Clean build: `cd android && ./gradlew clean && cd ..`
- For iOS: Clean Xcode build folder and rebuild
- Reinstall pods: `cd ios && rm -rf Pods Podfile.lock && pod install && cd ..`

### Network Issues
- Ensure device/emulator has internet connection
- Check API endpoint is accessible
- Verify Gemini API is not blocked

