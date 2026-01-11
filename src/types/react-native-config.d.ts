declare module 'react-native-config' {
  export interface NativeConfig {
    GEMINI_API_KEY?: string;
    GOOGLE_WEB_CLIENT_ID?: string;
    GOOGLE_ANDROID_CLIENT_ID?: string;
    GOOGLE_IOS_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    MONGODB_URI?: string;
    MONGODB_USERNAME?: string;
    MONGODB_PASSWORD?: string;
    MONGODB_DATABASE?: string;
    MONGODB_DATA_API_KEY?: string;
    MONGODB_DATA_API_URL?: string;
    MONGODB_CLUSTER_NAME?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
