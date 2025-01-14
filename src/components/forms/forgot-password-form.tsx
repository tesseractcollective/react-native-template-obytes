import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { usePasswordSendResetEmail } from '@/lib';

import { Text } from '../ui';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = React.useState(false);

  const forgotPasswordMutation = usePasswordSendResetEmail({
    onSuccess: () => {
      setEmailSentSuccess(true);
    },
  });

  const onSubmit = async () => {
    try {
      setLoading(true);
      forgotPasswordMutation.mutate({
        email,
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
        label="Email"
        placeholder="john@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        testID="email-input"
      />
      <Button
        label="Send Reset Instructions"
        onPress={onSubmit}
        loading={loading}
        testID="submit-button"
      />
      <Button
        variant="ghost"
        label="Back to Sign In"
        onPress={() => router.push('/(auth)/sign-in')}
        testID="back-to-login"
      />
      {emailSentSuccess && (
        <Text>Email sent successfully. Check your inbox for instructions.</Text>
      )}
    </View>
  );
}
