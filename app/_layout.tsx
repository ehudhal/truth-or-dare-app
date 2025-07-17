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
        
        /* Force tab navigation to work */
        [role="tablist"] {
          pointer-events: auto !important;
          z-index: 9999 !important;
        }
        
        [role="tablist"] > * {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        
        /* React Navigation web tab fix */
        .css-175oi2r {
          pointer-events: auto !important;
        }
        
        /* Tab bar specific fixes */
        [data-testid="bottom-tab-bar"] {
          pointer-events: auto !important;
        }
        
        [data-testid="bottom-tab-bar"] > * {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);
      
      // Add click event listeners as fallback
      const addClickListeners = () => {
        const tabButtons = document.querySelectorAll('[role="tab"]');
        tabButtons.forEach((button, index) => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Tab clicked:', index);
          });
        });
      };
      
      // Add listeners after a short delay to ensure DOM is ready
      setTimeout(addClickListeners, 1000);
      
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