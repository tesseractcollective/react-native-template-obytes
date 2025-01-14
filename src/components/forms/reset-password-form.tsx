import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { usePasswordReset } from '@/lib';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function ResetPasswordForm({
  email,
  ticket,
}: {
  email?: string;
  ticket?: string;
}) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const resetPasswordMutation = usePasswordReset({
    onSuccess: () => {
      router.push('/(auth)/sign-in');
    },
  });

  const onSubmit = async () => {
    try {
      if (!email || !ticket) {
        throw new Error('Email and ticket are required');
      }
      setLoading(true);
      resetPasswordMutation.mutate({
        password,
        email,
        ticket,
      });
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-4">
      <Input
        label="New Password"
        placeholder="********"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
      />
      <Input
        label="Confirm Password"
        placeholder="********"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        testID="confirm-password-input"
      />
      <Button
        label="Reset Password"
        onPress={onSubmit}
        loading={loading}
        testID="reset-button"
      />
    </View>
  );
}
