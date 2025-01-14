import { Env } from '@env';
import { createMutation } from 'react-query-kit';

import {
  type AuthAnonymousInput,
  AuthAnonymousSignInDoc,
  type AuthEmailInput,
  type AuthEmailPasswordInput,
  type AuthEmailPasswordSignUpInput,
  AuthEmailSendVerificationDoc,
  type AuthEmailSignupInput,
  type AuthEmailTicketInput,
  AuthEmailUpdateDoc,
  AuthEmailVerifyDoc,
  AuthMagicLinkSendEmailDoc,
  AuthMagicLinkSignInDoc,
  AuthMagicLinkSignUpAndSendDoc,
  type AuthOutput,
  AuthPasswordResetDoc,
  AuthPasswordSendResetEmailDoc,
  AuthPasswordSignInDoc,
  AuthPasswordSignUpAndSendVerificationDoc,
  type AuthResetPasswordInput,
  type AuthSmsCodeInput,
  type AuthSmsInput,
  AuthSmsSendCodeDoc,
  AuthSmsSignInDoc,
  AuthSmsSignUpAndSendDoc,
  type AuthSmsSignUpInput,
  AuthSmsUpdateDoc,
  AuthSmsVerifyDoc,
} from '@/api/generated/user-hooks';
import Logger from '@/lib/logger';
import type { RequestDocument } from '@/types/graphql-client-types';

import { authClient, authState, clearAuthState, Token } from './auth-state';
import { getStoredToken, setStoredToken } from './auth-storage';

export function loadTokenFromStorage() {
  authState.loading = true;
  const tokenValue = getStoredToken();
  if (tokenValue) {
    Logger.debug('auth: loadFromStorage token');
    authState.token = new Token(tokenValue);
  }
  authState.loading = false;
  authState.isInitialized = true;
}

export function setToken(tokenValue: string) {
  if (tokenValue === authState.token?.value) return;

  const token = new Token(tokenValue);
  if (token.isExpired) {
    Logger.debug('auth: setTokenIfNotExpired expired');
  } else {
    authState.token = token;
    setStoredToken(tokenValue);
  }
}

async function requestWrapper(document: RequestDocument, input: any) {
  const tenantId = Env.TENANT_ID;
  const client = authClient();
  let event: AuthOutput;

  const data = await client.request<any>({
    document,
    variables: { args: { ...input, tenantId } },
  });
  const dataKey = Object.keys(data)?.[0];
  event = data[dataKey];
  if (!event) {
    event = {
      tenantId,
    };
  } else if (event.token) {
    setToken(event.token);
  }

  return event;
}

async function handleAuthOutput(response: Promise<AuthOutput>) {
  const output = await response;
  if (output.token) {
    setToken(output.token);
  }
}

async function handleAuthOutputWithReturn(
  response: Promise<AuthOutput>
): Promise<Required<AuthOutput> | null> {
  const output = await response;
  if (output.token) {
    setToken(output.token);
    return output as Required<AuthOutput>;
  }
  return null;
}

export const useAnonymousSignin = createMutation<
  void,
  Omit<AuthAnonymousInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthAnonymousSignInDoc, input)),
});

export const useEmailSendVerification = createMutation<
  void,
  Omit<AuthEmailInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthEmailSendVerificationDoc, input)),
});

export const useEmailUpdate = createMutation<
  void,
  Omit<AuthEmailInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthEmailUpdateDoc, input)),
});

export const useEmailVerify = createMutation<
  void,
  Omit<AuthEmailTicketInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthEmailVerifyDoc, input)),
});

export const useMagicLinkSendEmail = createMutation<
  void,
  Omit<AuthEmailInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthMagicLinkSendEmailDoc, input)),
});

export const useMagicLinkSignIn = createMutation<
  void,
  Omit<AuthEmailTicketInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthMagicLinkSignInDoc, input)),
});

export const useMagicLinkSignUpAndSend = createMutation<
  void,
  Omit<AuthEmailSignupInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthMagicLinkSignUpAndSendDoc, input)),
});

export const usePasswordReset = createMutation<
  void,
  Omit<AuthResetPasswordInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthPasswordResetDoc, input)),
});

export const usePasswordSendResetEmail = createMutation<
  void,
  Omit<AuthEmailInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthPasswordSendResetEmailDoc, input)),
});

export const usePasswordSignIn = createMutation<
  void,
  Omit<AuthEmailPasswordInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthPasswordSignInDoc, input)),
});

export const usePasswordSignUpAndSendVerification = createMutation<
  Required<AuthOutput> | null,
  Omit<AuthEmailPasswordSignUpInput, 'tenantId'> & {
    confirmPassword: string;
  },
  Error
>({
  mutationFn: (input) => {
    const passwordTrimmed = input.password.trim();
    const confirmPasswordTrimmed = input.confirmPassword.trim();
    if (passwordTrimmed !== confirmPasswordTrimmed) {
      return Promise.reject(new Error('Passwords do not match'));
    }
    let newInput: Omit<typeof input, 'confirmPassword'> & {
      confirmPassword?: string;
    } = {
      ...input,
      password: passwordTrimmed,
    };
    delete newInput.confirmPassword;
    return handleAuthOutputWithReturn(
      requestWrapper(AuthPasswordSignUpAndSendVerificationDoc, newInput)
    );
  },
});

export const useSmsSendCode = createMutation<
  void,
  Omit<AuthSmsInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthSmsSendCodeDoc, input)),
});

export const useSmsSignIn = createMutation<
  void,
  Omit<AuthSmsCodeInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthSmsSignInDoc, input)),
});

export const useSmsSignUpAndSend = createMutation<
  void,
  Omit<AuthSmsSignUpInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthSmsSignUpAndSendDoc, input)),
});

export const useSmsUpdate = createMutation<
  void,
  Omit<AuthSmsInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthSmsUpdateDoc, input)),
});

export const useSmsVerify = createMutation<
  void,
  Omit<AuthSmsCodeInput, 'tenantId'>,
  Error
>({
  mutationFn: (input) =>
    handleAuthOutput(requestWrapper(AuthSmsVerifyDoc, input)),
});

export async function authSignOut() {
  Logger.debug('auth: signOut');
  clearAuthState();
}
