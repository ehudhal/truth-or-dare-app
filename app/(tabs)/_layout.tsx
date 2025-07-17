import { Tabs } from 'expo-router';
import { Gamepad2, Settings, Users, Plus, Package } from 'lucide-react-native';
import { Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TabLayout() {
  const navigation = useNavigation();
  
  // Debug navigation state
  if (Platform.OS === 'web') {
    console.log('Tab Layout - Navigation state:', navigation.getState());
  }
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
          // Web-specific fixes
          ...(Platform.OS === 'web' && {
            position: 'relative',
            zIndex: 999,
            pointerEvents: 'auto',
            cursor: 'pointer',
          }),
        },
        tabBarItemStyle: {
          flex: 1,
          ...(Platform.OS === 'web' && {
            cursor: 'pointer',
            pointerEvents: 'auto',
          }),
        },
        // Simplified web-specific fixes
        ...(Platform.OS === 'web' && {
          tabBarPressColor: 'rgba(139, 92, 246, 0.1)',
          tabBarPressOpacity: 0.8,
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Game',
          tabBarIcon: ({ size, color }) => (
            <Gamepad2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: 'Players',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
          // Add debug logging
          tabBarLabelStyle: { fontSize: 12 },
          tabBarLabel: 'Players',
        }}
      />
      <Tabs.Screen
        name="content"
        options={{
          title: 'Content',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: 'Packages',
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}