/* eslint-disable react/no-unstable-nested-components */
import { Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';

import { View } from '@/components/ui';
import Icon from '@/components/ui/icon';
import {
  Feed as FeedIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';
import { authState, useIsFirstTime } from '@/lib';

export default function TabLayout() {
  const authSnap = useSnapshot(authState);
  const isInitialized = authSnap.isInitialized;
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (isInitialized) {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, isInitialized]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FeedIcon color={color} />,
            tabBarButtonTestID: 'home-tab',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
            tabBarButtonTestID: 'settings-tab',
          }}
        />
        <Tabs.Screen
          name="sign-in"
          options={{
            title: 'SignIn',
            headerShown: false,
            tabBarIcon: ({ color }) => <Icon icon="sign-in" color={color} />,
            tabBarButtonTestID: 'signin-tab',
          }}
        />
        <Tabs.Screen
          name="p/[profileid]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
