import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { ResetPasswordForm } from '@/components/forms/reset-password-form';
import { Text } from '@/components/ui/text';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const { email, ticket } = params as { email?: string; ticket?: string };
  return (
    <View className="flex-1 justify-center p-4">
      <Text className="mb-6 text-center text-3xl font-bold">
        Set New Password
      </Text>
      <ResetPasswordForm email={email} ticket={ticket} />
    </View>
  );
}
