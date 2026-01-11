# Implementation Notes

## Code Extraction & Adaptation

All code has been extracted from the original web app at https://github.com/cumbersomeamir/merchai-studio and adapted for React Native.

### Key Changes Made:

1. **AI Service (`src/services/geminiService.ts`)**
   - Converted from `@google/genai` SDK to REST API calls (React Native compatible)
   - Uses `fetch` API for HTTP requests
   - Maintains same functionality: `generateMockup()` and `editMockup()`
   - Model: Using `gemini-1.5-flash` (can be changed in the service file)

2. **Components Adapted:**
   - **LogoUploader**: Web file input → React Native `react-native-image-picker`
   - **ProductSelector**: HTML/CSS → React Native StyleSheet with TouchableOpacity
   - **Editor**: Web form → React Native TextInput and TouchableOpacity
   - All styling converted from Tailwind CSS classes to React Native StyleSheet

3. **UI/UX Preserved:**
   - Same dark theme (#020617 background, slate colors)
   - Same layout structure (sidebar + main content)
   - Same product selection grid
   - Same editing workflow

4. **File Structure:**
   ```
   src/
   ├── components/     # All UI components (modular)
   ├── services/       # AI service (isolated)
   ├── types/          # TypeScript definitions
   ├── constants/      # Product list and prompts
   └── config/         # Environment configuration
   ```

## Modularity

The code is organized in a modular way:

- **Services**: `geminiService.ts` - Can be easily swapped or extended
- **Components**: Each component is self-contained and reusable
- **Types**: Centralized type definitions
- **Constants**: Easy to modify products and prompts
- **Config**: API key management in one place

## Testing Checklist

Before testing on emulator:

1. ✅ Set API key in `src/config/env.ts`
2. ✅ Install dependencies: `npm install`
3. ✅ iOS: Run `pod install` in ios folder
4. ✅ Permissions added to AndroidManifest.xml and Info.plist
5. ✅ Start Metro: `npm start`
6. ✅ Run on emulator: `npm run android` or `npm run ios`

## Known Considerations

1. **API Model**: Currently using `gemini-1.5-flash`. If you need image generation specifically, you might need to use `gemini-1.5-pro` or check Google's latest model names.

2. **Image Export**: Uses `react-native-fs` to save to device. On Android, saved to DocumentDirectoryPath. You may want to add sharing functionality later.

3. **Permissions**: Image picker requires runtime permissions on Android 6+. The app should request these automatically, but you may need to handle permission denial.

4. **Error Handling**: Basic error handling is in place. You may want to add retry logic or better error messages.

5. **Performance**: Large images are kept in memory as base64. For production, consider implementing image caching or compression.

## Next Steps for Production

- [ ] Add image compression before sending to API
- [ ] Implement image caching
- [ ] Add sharing functionality (react-native-share)
- [ ] Add loading states for better UX
- [ ] Implement offline error handling
- [ ] Add analytics/tracking
- [ ] Optimize for different screen sizes
- [ ] Add unit tests for services
- [ ] Add E2E tests for critical flows

