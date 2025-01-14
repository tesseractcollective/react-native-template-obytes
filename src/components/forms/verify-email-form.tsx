import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useEmailVerify } from '@/lib';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function VerifyEmailForm({ email }: { email?: string }) {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const verifyEmailMutation = useEmailVerify({
    onSuccess: () => {
      router.push('/(app)/');
    },
  });

  const onSubmit = async () => {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      setLoading(true);
      verifyEmailMutation.mutate({
        ticket: code,
        email,
      });
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    // TODO: Implement resend code logic
  };

  return (
    <View className="gap-4">
      <Input
        label="Verification Code"
        placeholder="Enter code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        testID="code-input"
      />
      <Button
        label="Verify Email"
        onPress={onSubmit}
        loading={loading}
        testID="verify-button"
      />
      <Button
        variant="ghost"
        label="Resend Code"
        onPress={resendCode}
        testID="resend-code"
      />
    </View>
  );
}
