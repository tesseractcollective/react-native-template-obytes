import React from 'react';
import { View } from 'react-native';

import { SignUpForm } from '@/components/forms/sign-up-form';
import { Text } from '@/components/ui/text';

export default function SignUpScreen() {
  return (
    <View className="flex-1 justify-center p-4">
      <Text className="mb-6 text-center text-3xl font-bold">
        Create Account
      </Text>
      <SignUpForm />
    </View>
  );
}
