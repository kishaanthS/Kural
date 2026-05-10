import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kural.news',
  appName: 'KURAL',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
