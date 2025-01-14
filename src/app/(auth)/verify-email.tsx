import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { VerifyEmailForm } from '@/components/forms/verify-email-form';
import { Text } from '@/components/ui/text';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const { email } = params as { email?: string };
  return (
    <View className="flex-1 justify-center p-4">
      <Text className="mb-6 text-center text-3xl font-bold">
        Verify Your Email
      </Text>
      <Text className="mb-6 text-center text-neutral-600">
        We've sent a verification code to your email address. Please enter it
        below.
      </Text>
      <VerifyEmailForm email={email} />
    </View>
  );
}
