import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';

export default function RootLayout() {
  useFrameworkReady();

  // Add web-specific polyfills and fixes
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Ensure proper touch event handling on web
      const style = document.createElement('style');
      style.innerHTML = `
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        [role="button"], button, [tabindex] {
          cursor: pointer !important;
          pointer-events: auto !important;
        }
        
        [role="tablist"] [role="tab"] {
          cursor: pointer !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}