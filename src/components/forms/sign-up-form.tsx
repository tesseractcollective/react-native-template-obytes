import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { usePasswordSignUpAndSendVerification } from '@/lib';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function SignUpForm() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const signUpMutation = usePasswordSignUpAndSendVerification({
    onSuccess: () => {
      router.push('/(auth)/verify-email-form');
    },
  });

  const onSubmit = async () => {
    try {
      setLoading(true);
      // TODO: Implement sign up logic
      signUpMutation.mutate({
        email,
        password,
        confirmPassword: password,
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
        label="Name"
        placeholder="John Doe"
        value={name}
        onChangeText={setName}
        testID="name-input"
      />
      <Input
        label="Email"
        placeholder="john@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        testID="email-input"
      />
      <Input
        label="Password"
        placeholder="********"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
      />
      <Button
        label="Sign Up"
        onPress={onSubmit}
        loading={loading}
        testID="sign-up-button"
      />
      <Button
        variant="ghost"
        label="Already have an account? Sign In"
        onPress={() => router.push('/(auth)/sign-in')}
        testID="sign-in-link"
      />
    </View>
  );
}
