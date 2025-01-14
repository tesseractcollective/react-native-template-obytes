import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function AuthLayout() {
  return (
    <View className="flex-1 items-stretch justify-center p-4">
      <View className="flex flex-1 items-stretch rounded-2xl border border-neutral-200 bg-white p-4 shadow">
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </View>
  );
}
