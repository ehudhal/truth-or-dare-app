import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  useFrameworkReady();

  // Add web-specific polyfills and fixes
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Minimal CSS fixes for tab navigation
      const style = document.createElement('style');
      style.innerHTML = `
        /* Essential tab navigation fixes */
        [role="tablist"] {
          pointer-events: auto !important;
        }
        
        [role="tablist"] [role="tab"] {
          cursor: pointer !important;
          pointer-events: auto !important;
        }
        
        /* Ensure buttons work */
        [role="button"], button {
          cursor: pointer !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
      
      // Debug: Log when tabs are clicked
      const addClickListeners = () => {
        const tabButtons = document.querySelectorAll('[role="tab"]');
        console.log('Found tab buttons:', tabButtons.length);
        tabButtons.forEach((button, index) => {
          button.addEventListener('click', (e) => {
            console.log('Tab clicked:', index, 'Will navigate');
          });
        });
      };
      
      // Add listeners after a short delay to ensure DOM is ready
      setTimeout(addClickListeners, 2000);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}