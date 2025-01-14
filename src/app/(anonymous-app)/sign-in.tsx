import { useRouter } from 'expo-router';
import React from 'react';

import type { SignInFormProps } from '@/components/forms/sign-in-form';
import { SignInForm } from '@/components/forms/sign-in-form';
import { FocusAwareStatusBar, View } from '@/components/ui';
import { usePasswordSignIn } from '@/lib';

export default function SignIn() {
  const passwordSignInMutation = usePasswordSignIn({
    onSuccess() {
      router.push('/(app)/');
    },
    onError(error) {
      console.log('ERROR', error);
    },
    throwOnError: true,
  });
  const router = useRouter();

  const onSubmit: SignInFormProps['onSubmit'] = (data) => {
    console.log('SUBMIT SIGN IN', data);
    passwordSignInMutation.mutate({
      email: data.email,
      password: data.password,
    });
    // signIn({ access: 'access-token', refresh: 'refresh-token' });
  };
  return (
    <View className="flex-1 items-stretch">
      <FocusAwareStatusBar />
      <SignInForm onSubmit={onSubmit} />
    </View>
  );
}
