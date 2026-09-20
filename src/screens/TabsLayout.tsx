import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';

export default function TabsLayout() {
  const { lang } = useLang();
  const t = getStrings(lang);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#8FAF8B' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="today-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="combine"
        options={{
          title: t.tabs.combine,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notebook"
        options={{
          title: t.tabs.notebook,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
