# MerchAI Studio - React Native App

A React Native mobile application for creating merchandise mockups using AI. Upload your logo, select a product, and generate professional product photos with AI-powered image generation.

## Features

- 🎨 Upload logo images (PNG/SVG with transparency)
- 👕 Select from various product types (T-Shirts, Hoodies, Caps, Mugs, etc.)
- ✨ Generate AI-powered merchandise mockups
- 🎯 Edit mockups with text prompts
- 💾 Export generated images
- 📱 Native mobile experience

## Prerequisites

- Node.js 20.11.1 or higher
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and Android SDK
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Installation

1. Install dependencies:
```bash
npm install
```

2. **Set up your Gemini API Key:**
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - The `.env` file is already created with your API key
   - If you need to change it, edit the `.env` file in the root directory:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   - **Important**: After changing `.env`, you need to rebuild the app (not just restart Metro)

3. For iOS, install CocoaPods:
```bash
cd ios && pod install && cd ..
```

## Running the App

### Start Metro Bundler
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

## Testing

```bash
npm test
```

## Project Structure

```
merchai-studio-app/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/
│   ├── components/       # React Native components
│   │   ├── LogoUploader.tsx
│   │   ├── ProductSelector.tsx
│   │   └── Editor.tsx
│   ├── services/        # API services
│   │   └── geminiService.ts
│   ├── types/           # TypeScript types
│   ├── constants/       # App constants
│   └── config/          # Configuration
│       └── env.ts       # Environment variables
├── App.tsx              # Main app component
├── index.js             # Entry point
└── package.json         # Dependencies
```

## Tech Stack

- React Native 0.83.1
- React 19.2.0
- TypeScript 5.9.3
- Jest 29.7.0
- Metro 0.81.0 (with SVG transformer)
- Google Gemini API (for AI image generation)
- react-native-image-picker (for logo uploads)
- react-native-fs (for file operations)

## Usage

1. **Upload Logo**: Tap the upload area and select your logo image
2. **Select Product**: Choose a product type from the grid
3. **Generate**: Tap "Generate Mockup" to create your merchandise image
4. **Edit**: Use text prompts to modify the generated image
5. **Export**: Save your final mockup to your device

## API Configuration

The app uses Google Gemini API for image generation. Make sure to:
- Set your API key in `src/config/env.ts`
- Have sufficient API quota
- Follow Google's API usage guidelines

## Notes

- The app requires an active internet connection for AI generation
- Image generation may take 10-30 seconds depending on API response time
- Generated images are stored in base64 format in memory
- Export functionality saves images to the device's document directory

## Troubleshooting

- **API Key Error**: Make sure you've set the GEMINI_API_KEY in `src/config/env.ts`
- **Image Upload Issues**: Check that you've granted camera/photo library permissions
- **Build Errors**: Make sure all native dependencies are properly linked (run `pod install` for iOS)

# merchai-studio-app
