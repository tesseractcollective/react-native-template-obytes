import React from 'react';
import { View } from 'react-native';

import { ForgotPasswordForm } from '@/components/forms/forgot-password-form';
import { Text } from '@/components/ui/text';

export default function ForgotPasswordScreen() {
  return (
    <View className="flex-1 justify-center p-4">
      <Text className="mb-6 text-center text-3xl font-bold">
        Reset Password
      </Text>
      <Text className="mb-6 text-center text-neutral-600">
        Enter your email address and we'll send you instructions to reset your
        password.
      </Text>
      <ForgotPasswordForm />
    </View>
  );
}
